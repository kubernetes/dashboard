// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package stackdriver

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/url"
	"reflect"
	"strconv"
	"time"

	gce "cloud.google.com/go/compute/metadata"
	"github.com/golang/glog"
	"github.com/prometheus/client_golang/prometheus"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/googleapi"
	sd_api "google.golang.org/api/monitoring/v3"
	gce_util "k8s.io/heapster/common/gce"
	"k8s.io/heapster/metrics/core"
)

const (
	maxTimeseriesPerRequest = 200
	// 2 seconds on SD side, 1 extra for networking overhead
	sdRequestLatencySec           = 3
	httpResponseCodeUnknown       = -100
	httpResponseCodeClientTimeout = -1
)

type StackdriverSink struct {
	project               string
	cluster               string
	zone                  string
	stackdriverClient     *sd_api.Service
	minInterval           time.Duration
	lastExportTime        time.Time
	batchExportTimeoutSec int
	initialDelaySec       int
}

type metricMetadata struct {
	MetricKind string
	ValueType  string
	Name       string
}

var (
	// Known metrics metadata

	cpuReservedCoresMD = &metricMetadata{
		MetricKind: "GAUGE",
		ValueType:  "DOUBLE",
		Name:       "container.googleapis.com/container/cpu/reserved_cores",
	}

	cpuUsageTimeMD = &metricMetadata{
		MetricKind: "CUMULATIVE",
		ValueType:  "DOUBLE",
		Name:       "container.googleapis.com/container/cpu/usage_time",
	}

	uptimeMD = &metricMetadata{
		MetricKind: "CUMULATIVE",
		ValueType:  "DOUBLE",
		Name:       "container.googleapis.com/container/uptime",
	}

	networkRxMD = &metricMetadata{
		MetricKind: "CUMULATIVE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/network/received_bytes_count",
	}

	networkTxMD = &metricMetadata{
		MetricKind: "CUMULATIVE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/network/sent_bytes_count",
	}

	memoryLimitMD = &metricMetadata{
		MetricKind: "GAUGE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/memory/bytes_total",
	}

	memoryBytesUsedMD = &metricMetadata{
		MetricKind: "GAUGE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/memory/bytes_used",
	}

	memoryPageFaultsMD = &metricMetadata{
		MetricKind: "CUMULATIVE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/memory/page_fault_count",
	}

	diskBytesUsedMD = &metricMetadata{
		MetricKind: "GAUGE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/disk/bytes_used",
	}

	diskBytesTotalMD = &metricMetadata{
		MetricKind: "GAUGE",
		ValueType:  "INT64",
		Name:       "container.googleapis.com/container/disk/bytes_total",
	}

	// Sink performance metrics

	requestsSent = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Namespace: "heapster",
			Subsystem: "stackdriver",
			Name:      "requests_count",
			Help:      "Number of requests with return codes",
		},
		[]string{"code"},
	)

	timeseriesSent = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Namespace: "heapster",
			Subsystem: "stackdriver",
			Name:      "timeseries_count",
			Help:      "Number of Timeseries sent with return codes",
		},
		[]string{"code"},
	)
	requestLatency = prometheus.NewSummary(
		prometheus.SummaryOpts{
			Namespace: "heapster",
			Subsystem: "stackdriver",
			Name:      "request_latency_milliseconds",
			Help:      "Latency of requests to Stackdriver Monitoring API.",
		},
	)
)

func (sink *StackdriverSink) Name() string {
	return "Stackdriver Sink"
}

func (sink *StackdriverSink) Stop() {
}

func (sink *StackdriverSink) processMetrics(metricValues map[string]core.MetricValue,
	timestamp time.Time, labels map[string]string, createTime time.Time) []*sd_api.TimeSeries {
	timeseries := make([]*sd_api.TimeSeries, 0)
	for name, value := range metricValues {
		ts := sink.TranslateMetric(timestamp, labels, name, value, createTime)
		if ts != nil {
			timeseries = append(timeseries, ts)
		}
	}
	return timeseries
}

func (sink *StackdriverSink) ExportData(dataBatch *core.DataBatch) {
	// Make sure we don't export metrics too often.
	if dataBatch.Timestamp.Before(sink.lastExportTime.Add(sink.minInterval)) {
		glog.V(2).Infof("Skipping batch from %s because there hasn't passed %s from last export time %s", dataBatch.Timestamp, sink.minInterval, sink.lastExportTime)
		return
	}
	sink.lastExportTime = dataBatch.Timestamp

	requests := []*sd_api.CreateTimeSeriesRequest{}
	req := getReq()
	for key, metricSet := range dataBatch.MetricSets {
		switch metricSet.Labels["type"] {
		case core.MetricSetTypeNode, core.MetricSetTypePod, core.MetricSetTypePodContainer, core.MetricSetTypeSystemContainer:
		default:
			continue
		}

		if metricSet.CreateTime.IsZero() {
			glog.V(2).Infof("Skipping incorrect metric set %s because create time is zero", key)
			continue
		}

		if metricSet.Labels["type"] == core.MetricSetTypeNode {
			metricSet.Labels[core.LabelContainerName.Key] = "machine"
		}

		computedMetrics := sink.preprocessMemoryMetrics(metricSet)

		computedTimeseries := sink.processMetrics(computedMetrics.MetricValues, dataBatch.Timestamp, metricSet.Labels, metricSet.CreateTime)
		timeseries := sink.processMetrics(metricSet.MetricValues, dataBatch.Timestamp, metricSet.Labels, metricSet.CreateTime)

		timeseries = append(timeseries, computedTimeseries...)

		for _, ts := range timeseries {
			req.TimeSeries = append(req.TimeSeries, ts)
			if len(req.TimeSeries) >= maxTimeseriesPerRequest {
				requests = append(requests, req)
				req = getReq()
			}
		}

		for _, metric := range metricSet.LabeledMetrics {
			point := sink.TranslateLabeledMetric(dataBatch.Timestamp, metricSet.Labels, metric, metricSet.CreateTime)

			if point != nil {
				req.TimeSeries = append(req.TimeSeries, point)
			}
			if len(req.TimeSeries) >= maxTimeseriesPerRequest {
				requests = append(requests, req)
				req = getReq()
			}
		}
	}

	if len(req.TimeSeries) > 0 {
		requests = append(requests, req)
	}

	go sink.sendRequests(requests)
}

func (sink *StackdriverSink) sendRequests(requests []*sd_api.CreateTimeSeriesRequest) {
	// Each worker can handle at least batchExportTimeout/sdRequestLatencySec requests within the specified period.
	// 5 extra workers just in case.
	workers := 5 + len(requests)/(sink.batchExportTimeoutSec/sdRequestLatencySec)
	requestQueue := make(chan *sd_api.CreateTimeSeriesRequest)
	completedQueue := make(chan bool)

	// Launch Go routines responsible for sending requests
	for i := 0; i < workers; i++ {
		go sink.requestSender(requestQueue, completedQueue)
	}

	timeout := time.Duration(sink.batchExportTimeoutSec) * time.Second
	timeoutSending := time.After(timeout)
	timeoutCompleted := time.After(timeout)

forloop:
	for i, r := range requests {
		select {
		case requestQueue <- r:
			// yet another request added to queue
		case <-timeoutSending:
			glog.Warningf("Timeout while exporting metrics to Stackdriver. Dropping %d out of %d requests.", len(requests)-i, len(requests))
			// TODO(piosz): consider cancelling requests in flight
			// Report dropped requests in metrics.
			for _, req := range requests[i:] {
				requestsSent.WithLabelValues(strconv.Itoa(httpResponseCodeClientTimeout)).Inc()
				timeseriesSent.
					WithLabelValues(strconv.Itoa(httpResponseCodeClientTimeout)).
					Add(float64(len(req.TimeSeries)))
			}
			break forloop
		}
	}

	// Close the channel in order to cancel exporting routines.
	close(requestQueue)

	workersCompleted := 0
	for {
		select {
		case <-completedQueue:
			workersCompleted++
			if workersCompleted == workers {
				glog.V(4).Infof("All %d workers successfully finished sending requests to SD.", workersCompleted)
				return
			}
		case <-timeoutCompleted:
			glog.Warningf("Only %d out of %d workers successfully finished sending requests to SD. Some metrics might be lost.", workersCompleted, workers)
			return
		}
	}
}

func (sink *StackdriverSink) requestSender(reqQueue chan *sd_api.CreateTimeSeriesRequest, completedQueue chan bool) {
	defer func() {
		completedQueue <- true
	}()
	time.Sleep(time.Duration(rand.Intn(1000*sink.initialDelaySec)) * time.Millisecond)
	for {
		select {
		case req, active := <-reqQueue:
			if !active {
				return
			}
			sink.sendOneRequest(req)
		}
	}
}

func marshalRequestAndLog(printer func([]byte), req *sd_api.CreateTimeSeriesRequest) {
	reqJson, errJson := json.Marshal(req)
	if errJson != nil {
		glog.Errorf("Couldn't marshal Stackdriver request %v", errJson)
	} else {
		printer(reqJson)
	}
}

func (sink *StackdriverSink) sendOneRequest(req *sd_api.CreateTimeSeriesRequest) {
	startTime := time.Now()
	empty, err := sink.stackdriverClient.Projects.TimeSeries.Create(fullProjectName(sink.project), req).Do()

	var responseCode int
	if err != nil {
		glog.Warningf("Error while sending request to Stackdriver %v", err)
		// Convert request to json and log it, but only if logging level is equal to 2 or more.
		if glog.V(2) {
			marshalRequestAndLog(func(reqJson []byte) {
				glog.V(2).Infof("The request was: %s", reqJson)
			}, req)
		}
		switch reflect.Indirect(reflect.ValueOf(err)).Type() {
		case reflect.Indirect(reflect.ValueOf(&googleapi.Error{})).Type():
			responseCode = err.(*googleapi.Error).Code
		default:
			responseCode = httpResponseCodeUnknown
		}
	} else {
		// Convert request to json and log it, but only if logging level is equal to 10 or more.
		if glog.V(10) {
			marshalRequestAndLog(func(reqJson []byte) {
				glog.V(10).Infof("Stackdriver request sent: %s", reqJson)
			}, req)
		}
		responseCode = empty.ServerResponse.HTTPStatusCode
	}

	requestsSent.WithLabelValues(strconv.Itoa(responseCode)).Inc()
	timeseriesSent.
		WithLabelValues(strconv.Itoa(responseCode)).
		Add(float64(len(req.TimeSeries)))
	requestLatency.Observe(time.Since(startTime).Seconds() / time.Millisecond.Seconds())

}

func CreateStackdriverSink(uri *url.URL) (core.DataSink, error) {
	if len(uri.Scheme) > 0 {
		return nil, fmt.Errorf("Scheme should not be set for Stackdriver sink")
	}
	if len(uri.Host) > 0 {
		return nil, fmt.Errorf("Host should not be set for Stackdriver sink")
	}

	opts := uri.Query()

	cluster_name := ""
	if len(opts["cluster_name"]) >= 1 {
		cluster_name = opts["cluster_name"][0]
	}

	minInterval := time.Nanosecond
	if len(opts["min_interval_sec"]) >= 1 {
		if interval, err := strconv.Atoi(opts["min_interval_sec"][0]); err != nil {
			return nil, fmt.Errorf("Min interval should be an integer, found: %v", opts["min_interval_sec"][0])
		} else {
			minInterval = time.Duration(interval) * time.Second
		}
	}

	batchExportTimeoutSec := 60
	var err error
	if len(opts["batch_export_timeout_sec"]) >= 1 {
		if batchExportTimeoutSec, err = strconv.Atoi(opts["batch_export_timeout_sec"][0]); err != nil {
			return nil, fmt.Errorf("Batch export timeout should be an integer, found: %v", opts["batch_export_timeout_sec"][0])
		}
	}

	initialDelaySec := sdRequestLatencySec
	if len(opts["initial_delay_sec"]) >= 1 {
		if initialDelaySec, err = strconv.Atoi(opts["initial_delay_sec"][0]); err != nil {
			return nil, fmt.Errorf("Initial delay should be an integer, found: %v", opts["initial_delay_sec"][0])
		}
	}

	if err := gce_util.EnsureOnGCE(); err != nil {
		return nil, err
	}

	// Detect project ID
	projectId, err := gce.ProjectID()
	if err != nil {
		return nil, err
	}

	// Detect zone
	zone, err := gce.Zone()
	if err != nil {
		return nil, err
	}

	// Create Google Cloud Monitoring service
	client := oauth2.NewClient(oauth2.NoContext, google.ComputeTokenSource(""))
	stackdriverClient, err := sd_api.New(client)
	if err != nil {
		return nil, err
	}

	sink := &StackdriverSink{
		project:               projectId,
		cluster:               cluster_name,
		zone:                  zone,
		stackdriverClient:     stackdriverClient,
		minInterval:           minInterval,
		batchExportTimeoutSec: batchExportTimeoutSec,
		initialDelaySec:       initialDelaySec,
	}

	// Register sink metrics
	prometheus.MustRegister(requestsSent)
	prometheus.MustRegister(timeseriesSent)
	prometheus.MustRegister(requestLatency)

	glog.Infof("Created Stackdriver sink")

	return sink, nil
}

func (sink *StackdriverSink) preprocessMemoryMetrics(metricSet *core.MetricSet) *core.MetricSet {
	usage := metricSet.MetricValues[core.MetricMemoryUsage.MetricDescriptor.Name].IntValue
	workingSet := metricSet.MetricValues[core.MetricMemoryWorkingSet.MetricDescriptor.Name].IntValue
	bytesUsed := core.MetricValue{
		IntValue: usage - workingSet,
	}

	newMetricSet := &core.MetricSet{
		MetricValues: map[string]core.MetricValue{},
	}

	newMetricSet.MetricValues["memory/bytes_used"] = bytesUsed

	memoryFaults := metricSet.MetricValues[core.MetricMemoryPageFaults.MetricDescriptor.Name].IntValue
	majorMemoryFaults := metricSet.MetricValues[core.MetricMemoryMajorPageFaults.MetricDescriptor.Name].IntValue

	minorMemoryFaults := core.MetricValue{
		IntValue: memoryFaults - majorMemoryFaults,
	}
	newMetricSet.MetricValues["memory/minor_page_faults"] = minorMemoryFaults

	return newMetricSet
}

func (sink *StackdriverSink) TranslateLabeledMetric(timestamp time.Time, labels map[string]string, metric core.LabeledMetric, createTime time.Time) *sd_api.TimeSeries {
	resourceLabels := sink.getResourceLabels(labels)
	switch metric.Name {
	case core.MetricFilesystemUsage.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.MetricValue.IntValue)
		ts := createTimeSeries(resourceLabels, diskBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"device_name": metric.Labels[core.LabelResourceID.Key],
		}
		return ts
	case core.MetricFilesystemLimit.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.MetricValue.IntValue)
		ts := createTimeSeries(resourceLabels, diskBytesTotalMD, point)
		ts.Metric.Labels = map[string]string{
			"device_name": metric.Labels[core.LabelResourceID.Key],
		}
		return ts
	default:
		return nil
	}
}

func (sink *StackdriverSink) TranslateMetric(timestamp time.Time, labels map[string]string, name string, value core.MetricValue, createTime time.Time) *sd_api.TimeSeries {
	resourceLabels := sink.getResourceLabels(labels)
	if !createTime.Before(timestamp) {
		glog.V(4).Infof("Error translating metric %v for pod %v: batch timestamp %v earlier than pod create time %v", name, labels["pod_name"], timestamp, createTime)
		return nil
	}
	switch name {
	case core.MetricUptime.MetricDescriptor.Name:
		doubleValue := float64(value.IntValue) / float64(time.Second/time.Millisecond)
		point := sink.doublePoint(timestamp, createTime, doubleValue)
		return createTimeSeries(resourceLabels, uptimeMD, point)
	case core.MetricCpuLimit.MetricDescriptor.Name:
		// converting from millicores to cores
		point := sink.doublePoint(timestamp, timestamp, float64(value.IntValue)/1000)
		return createTimeSeries(resourceLabels, cpuReservedCoresMD, point)
	case core.MetricCpuUsage.MetricDescriptor.Name:
		point := sink.doublePoint(timestamp, createTime, float64(value.IntValue)/float64(time.Second/time.Nanosecond))
		return createTimeSeries(resourceLabels, cpuUsageTimeMD, point)
	case core.MetricNetworkRx.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, createTime, value.IntValue)
		return createTimeSeries(resourceLabels, networkRxMD, point)
	case core.MetricNetworkTx.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, createTime, value.IntValue)
		return createTimeSeries(resourceLabels, networkTxMD, point)
	case core.MetricMemoryLimit.MetricDescriptor.Name:
		// omit nodes, using memory/node_allocatable instead
		if labels["type"] == core.MetricSetTypeNode {
			return nil
		}
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		return createTimeSeries(resourceLabels, memoryLimitMD, point)
	case core.MetricNodeMemoryAllocatable.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		return createTimeSeries(resourceLabels, memoryLimitMD, point)
	case core.MetricMemoryMajorPageFaults.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, createTime, value.IntValue)
		ts := createTimeSeries(resourceLabels, memoryPageFaultsMD, point)
		ts.Metric.Labels = map[string]string{
			"fault_type": "major",
		}
		return ts
	case "memory/bytes_used":
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		ts := createTimeSeries(resourceLabels, memoryBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"memory_type": "evictable",
		}
		return ts
	case core.MetricMemoryWorkingSet.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		ts := createTimeSeries(resourceLabels, memoryBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"memory_type": "non-evictable",
		}
		return ts
	case "memory/minor_page_faults":
		point := sink.intPoint(timestamp, createTime, value.IntValue)
		ts := createTimeSeries(resourceLabels, memoryPageFaultsMD, point)
		ts.Metric.Labels = map[string]string{
			"fault_type": "minor",
		}
		return ts
	default:
		return nil
	}
}

func (sink *StackdriverSink) getResourceLabels(labels map[string]string) map[string]string {
	return map[string]string{
		"project_id":     sink.project,
		"cluster_name":   sink.cluster,
		"zone":           sink.zone,
		"instance_id":    labels[core.LabelHostID.Key],
		"namespace_id":   labels[core.LabelPodNamespaceUID.Key],
		"pod_id":         labels[core.LabelPodId.Key],
		"container_name": labels[core.LabelContainerName.Key],
	}
}

func createTimeSeries(resourceLabels map[string]string, metadata *metricMetadata, point *sd_api.Point) *sd_api.TimeSeries {
	return &sd_api.TimeSeries{
		Metric: &sd_api.Metric{
			Type: metadata.Name,
		},
		MetricKind: metadata.MetricKind,
		ValueType:  metadata.ValueType,
		Resource: &sd_api.MonitoredResource{
			Labels: resourceLabels,
			Type:   "gke_container",
		},
		Points: []*sd_api.Point{point},
	}
}

func (sink *StackdriverSink) doublePoint(endTime time.Time, startTime time.Time, value float64) *sd_api.Point {
	return &sd_api.Point{
		Interval: &sd_api.TimeInterval{
			EndTime:   endTime.Format(time.RFC3339),
			StartTime: startTime.Format(time.RFC3339),
		},
		Value: &sd_api.TypedValue{
			DoubleValue:     value,
			ForceSendFields: []string{"DoubleValue"},
		},
	}

}

func (sink *StackdriverSink) intPoint(endTime time.Time, startTime time.Time, value int64) *sd_api.Point {
	return &sd_api.Point{
		Interval: &sd_api.TimeInterval{
			EndTime:   endTime.Format(time.RFC3339),
			StartTime: startTime.Format(time.RFC3339),
		},
		Value: &sd_api.TypedValue{
			Int64Value:      value,
			ForceSendFields: []string{"Int64Value"},
		},
	}
}

func fullProjectName(name string) string {
	return fmt.Sprintf("projects/%s", name)
}

func getReq() *sd_api.CreateTimeSeriesRequest {
	return &sd_api.CreateTimeSeriesRequest{TimeSeries: make([]*sd_api.TimeSeries, 0)}
}
