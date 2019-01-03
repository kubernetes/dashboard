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
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/url"
	"strconv"
	"strings"
	"time"

	gce "cloud.google.com/go/compute/metadata"
	sd_api "cloud.google.com/go/monitoring/apiv3"
	"github.com/golang/glog"
	google_proto "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/prometheus/client_golang/prometheus"
	"google.golang.org/genproto/googleapis/api/metric"
	"google.golang.org/genproto/googleapis/api/monitoredres"
	monitoringpb "google.golang.org/genproto/googleapis/monitoring/v3"
	grpc_codes "google.golang.org/grpc/codes"
	grpc_status "google.golang.org/grpc/status"
	gce_util "k8s.io/heapster/common/gce"
	"k8s.io/heapster/metrics/core"
)

const (
	maxTimeseriesPerRequest = 200
	// 2 seconds on SD side, 1 extra for networking overhead
	sdRequestLatencySec = 3
)

type StackdriverSink struct {
	project               string
	clusterName           string
	clusterLocation       string
	heapsterZone          string
	stackdriverClient     *sd_api.MetricClient
	minInterval           time.Duration
	lastExportTime        time.Time
	batchExportTimeoutSec int
	initialDelaySec       int
	useOldResourceModel   bool
	useNewResourceModel   bool
}

type metricMetadata struct {
	MetricKind metric.MetricDescriptor_MetricKind
	ValueType  metric.MetricDescriptor_ValueType
	Name       string
}

var (
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
	timestamp time.Time, labels map[string]string, collectionStartTime time.Time, entityCreateTime time.Time) []*monitoringpb.TimeSeries {
	var timeSeries []*monitoringpb.TimeSeries
	if sink.useOldResourceModel {
		for name, value := range metricValues {
			if ts := sink.LegacyTranslateMetric(timestamp, labels, name, value, collectionStartTime); ts != nil {
				timeSeries = append(timeSeries, ts)
			}
		}
	}
	if sink.useNewResourceModel {
		for name, value := range metricValues {
			if ts := sink.TranslateMetric(timestamp, labels, name, value, collectionStartTime, entityCreateTime); ts != nil {
				timeSeries = append(timeSeries, ts)
			}
		}
	}
	return timeSeries
}

func (sink *StackdriverSink) ExportData(dataBatch *core.DataBatch) {
	// Make sure we don't export metrics too often.
	if dataBatch.Timestamp.Before(sink.lastExportTime.Add(sink.minInterval)) {
		glog.V(2).Infof("Skipping batch from %s because there hasn't passed %s from last export time %s", dataBatch.Timestamp, sink.minInterval, sink.lastExportTime)
		return
	}
	sink.lastExportTime = dataBatch.Timestamp

	requests := []*monitoringpb.CreateTimeSeriesRequest{}
	req := getReq(sink.project)
	for key, metricSet := range dataBatch.MetricSets {
		switch metricSet.Labels["type"] {
		case core.MetricSetTypeNode, core.MetricSetTypePod, core.MetricSetTypePodContainer, core.MetricSetTypeSystemContainer:
		default:
			continue
		}

		if metricSet.CollectionStartTime.IsZero() {
			glog.V(2).Infof("Skipping incorrect metric set %s because collection start time is zero", key)
			continue
		}

		// Hack used with legacy resource type "gke_container". It is used to represent three
		// Kubernetes resources: container, pod or node. For pods container name is empty, for nodes it
		// is set to artificial value "machine". Otherwise it stores actual container name.
		// With new resource types, container_name is ignored for resources other than "k8s_container"
		if sink.useOldResourceModel && metricSet.Labels["type"] == core.MetricSetTypeNode {
			metricSet.Labels[core.LabelContainerName.Key] = "machine"
		}

		derivedMetrics := sink.computeDerivedMetrics(metricSet)

		derivedTimeseries := sink.processMetrics(derivedMetrics.MetricValues, dataBatch.Timestamp, metricSet.Labels, metricSet.CollectionStartTime, metricSet.EntityCreateTime)
		timeseries := sink.processMetrics(metricSet.MetricValues, dataBatch.Timestamp, metricSet.Labels, metricSet.CollectionStartTime, metricSet.EntityCreateTime)

		timeseries = append(timeseries, derivedTimeseries...)

		for _, ts := range timeseries {
			req.TimeSeries = append(req.TimeSeries, ts)
			if len(req.TimeSeries) >= maxTimeseriesPerRequest {
				requests = append(requests, req)
				req = getReq(sink.project)
			}
		}

		for _, metric := range metricSet.LabeledMetrics {
			if sink.useOldResourceModel {
				if point := sink.LegacyTranslateLabeledMetric(dataBatch.Timestamp, metricSet.Labels, metric, metricSet.CollectionStartTime); point != nil {
					req.TimeSeries = append(req.TimeSeries, point)
				}

				if len(req.TimeSeries) >= maxTimeseriesPerRequest {
					requests = append(requests, req)
					req = getReq(sink.project)
				}
			}
			if sink.useNewResourceModel {
				point := sink.TranslateLabeledMetric(dataBatch.Timestamp, metricSet.Labels, metric, metricSet.CollectionStartTime)
				if point != nil {
					req.TimeSeries = append(req.TimeSeries, point)
				}

				if len(req.TimeSeries) >= maxTimeseriesPerRequest {
					requests = append(requests, req)
					req = getReq(sink.project)
				}
			}
		}
	}

	if len(req.TimeSeries) > 0 {
		requests = append(requests, req)
	}

	go sink.sendRequests(requests)
}

func (sink *StackdriverSink) sendRequests(requests []*monitoringpb.CreateTimeSeriesRequest) {
	// Each worker can handle at least batchExportTimeout/sdRequestLatencySec requests within the specified period.
	// 5 extra workers just in case.
	workers := 5 + len(requests)/(sink.batchExportTimeoutSec/sdRequestLatencySec)
	requestQueue := make(chan *monitoringpb.CreateTimeSeriesRequest)
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
				requestsSent.WithLabelValues(grpc_codes.DeadlineExceeded.String()).Inc()
				timeseriesSent.
					WithLabelValues(grpc_codes.DeadlineExceeded.String()).
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

func (sink *StackdriverSink) requestSender(reqQueue chan *monitoringpb.CreateTimeSeriesRequest, completedQueue chan bool) {
	defer func() {
		completedQueue <- true
	}()
	time.Sleep(time.Duration(rand.Intn(1000*sink.initialDelaySec)) * time.Millisecond)
	for req := range reqQueue {
		sink.sendOneRequest(req)
	}
}

func marshalRequestAndLog(printer func([]byte), req *monitoringpb.CreateTimeSeriesRequest) {
	reqJson, errJson := json.Marshal(req)
	if errJson != nil {
		glog.Errorf("Couldn't marshal Stackdriver request %v", errJson)
	} else {
		printer(reqJson)
	}
}

func (sink *StackdriverSink) sendOneRequest(req *monitoringpb.CreateTimeSeriesRequest) {
	startTime := time.Now()
	err := sink.stackdriverClient.CreateTimeSeries(context.Background(), req)

	var responseCode grpc_codes.Code
	if err != nil {
		glog.Warningf("Error while sending request to Stackdriver %v", err)
		// Convert request to json and log it, but only if logging level is equal to 2 or more.
		if glog.V(2) {
			marshalRequestAndLog(func(reqJson []byte) {
				glog.V(2).Infof("The request was: %s", reqJson)
			}, req)
		}
		if status, ok := grpc_status.FromError(err); ok {
			responseCode = status.Code()
		} else {
			responseCode = grpc_codes.Unknown
		}
	} else {
		// Convert request to json and log it, but only if logging level is equal to 10 or more.
		if glog.V(10) {
			marshalRequestAndLog(func(reqJson []byte) {
				glog.V(10).Infof("Stackdriver request sent: %s", reqJson)
			}, req)
		}
		responseCode = grpc_codes.OK
	}

	requestsSent.WithLabelValues(responseCode.String()).Inc()
	timeseriesSent.
		WithLabelValues(responseCode.String()).
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

	useOldResourceModel := true
	if err := parseBoolFlag(opts, "use_old_resources", &useOldResourceModel); err != nil {
		return nil, err
	}
	useNewResourceModel := false
	if err := parseBoolFlag(opts, "use_new_resources", &useNewResourceModel); err != nil {
		return nil, err
	}

	cluster_name := ""
	if len(opts["cluster_name"]) >= 1 {
		cluster_name = opts["cluster_name"][0]
	} else {
		glog.Warning("Cluster name required but not provided, using empty cluster name.")
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

	// Detect zone for old resource model
	heapsterZone, err := gce.Zone()
	if err != nil {
		return nil, err
	}

	clusterLocation := heapsterZone
	if len(opts["cluster_location"]) >= 1 {
		clusterLocation = opts["cluster_location"][0]
	} else if useNewResourceModel {
		glog.Warning("Cluster location required with new resource model but not provided. Falling back to the zone where Heapster runs.")
	}

	// Create Metric Client
	stackdriverClient, err := sd_api.NewMetricClient(context.Background())
	if err != nil {
		return nil, err
	}

	sink := &StackdriverSink{
		project:               projectId,
		clusterName:           cluster_name,
		clusterLocation:       clusterLocation,
		heapsterZone:          heapsterZone,
		stackdriverClient:     stackdriverClient,
		minInterval:           minInterval,
		batchExportTimeoutSec: batchExportTimeoutSec,
		initialDelaySec:       initialDelaySec,
		useOldResourceModel:   useOldResourceModel,
		useNewResourceModel:   useNewResourceModel,
	}

	// Register sink metrics
	prometheus.MustRegister(requestsSent)
	prometheus.MustRegister(timeseriesSent)
	prometheus.MustRegister(requestLatency)

	glog.Infof("Created Stackdriver sink")

	return sink, nil
}

func parseBoolFlag(opts map[string][]string, name string, targetValue *bool) error {
	if len(opts[name]) >= 1 {
		var err error
		*targetValue, err = strconv.ParseBool(opts[name][0])
		if err != nil {
			return fmt.Errorf("%s = %s is not correct boolean value", name, opts[name][0])
		}
	}
	return nil
}

func (sink *StackdriverSink) computeDerivedMetrics(metricSet *core.MetricSet) *core.MetricSet {
	newMetricSet := &core.MetricSet{MetricValues: map[string]core.MetricValue{}}
	usage, usageOK := metricSet.MetricValues[core.MetricMemoryUsage.MetricDescriptor.Name]
	workingSet, workingSetOK := metricSet.MetricValues[core.MetricMemoryWorkingSet.MetricDescriptor.Name]

	if usageOK && workingSetOK {
		newMetricSet.MetricValues["memory/bytes_used"] = core.MetricValue{
			IntValue: usage.IntValue - workingSet.IntValue,
		}
	}

	memoryFaults, memoryFaultsOK := metricSet.MetricValues[core.MetricMemoryPageFaults.MetricDescriptor.Name]
	majorMemoryFaults, majorMemoryFaultsOK := metricSet.MetricValues[core.MetricMemoryMajorPageFaults.MetricDescriptor.Name]
	if memoryFaultsOK && majorMemoryFaultsOK {
		newMetricSet.MetricValues["memory/minor_page_faults"] = core.MetricValue{
			IntValue: memoryFaults.IntValue - majorMemoryFaults.IntValue,
		}
	}

	return newMetricSet
}

func (sink *StackdriverSink) LegacyTranslateLabeledMetric(timestamp time.Time, labels map[string]string, metric core.LabeledMetric, collectionStartTime time.Time) *monitoringpb.TimeSeries {
	resourceLabels := sink.legacyGetResourceLabels(labels)
	switch metric.Name {
	case core.MetricFilesystemUsage.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyDiskBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"device_name": metric.Labels[core.LabelResourceID.Key],
		}
		return ts
	case core.MetricFilesystemLimit.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyDiskBytesTotalMD, point)
		ts.Metric.Labels = map[string]string{
			"device_name": metric.Labels[core.LabelResourceID.Key],
		}
		return ts
	case core.MetricAcceleratorMemoryTotal.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyAcceleratorMemoryTotalMD, point)
		ts.Metric.Labels = map[string]string{
			core.LabelAcceleratorMake.Key:  metric.Labels[core.LabelAcceleratorMake.Key],
			core.LabelAcceleratorModel.Key: metric.Labels[core.LabelAcceleratorModel.Key],
			core.LabelAcceleratorID.Key:    metric.Labels[core.LabelAcceleratorID.Key],
		}
		return ts
	case core.MetricAcceleratorMemoryUsed.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyAcceleratorMemoryUsedMD, point)
		ts.Metric.Labels = map[string]string{
			core.LabelAcceleratorMake.Key:  metric.Labels[core.LabelAcceleratorMake.Key],
			core.LabelAcceleratorModel.Key: metric.Labels[core.LabelAcceleratorModel.Key],
			core.LabelAcceleratorID.Key:    metric.Labels[core.LabelAcceleratorID.Key],
		}
		return ts
	case core.MetricAcceleratorDutyCycle.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, metric.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyAcceleratorDutyCycleMD, point)
		ts.Metric.Labels = map[string]string{
			core.LabelAcceleratorMake.Key:  metric.Labels[core.LabelAcceleratorMake.Key],
			core.LabelAcceleratorModel.Key: metric.Labels[core.LabelAcceleratorModel.Key],
			core.LabelAcceleratorID.Key:    metric.Labels[core.LabelAcceleratorID.Key],
		}
		return ts
	}
	return nil
}

func (sink *StackdriverSink) LegacyTranslateMetric(timestamp time.Time, labels map[string]string, name string, value core.MetricValue, collectionStartTime time.Time) *monitoringpb.TimeSeries {
	resourceLabels := sink.legacyGetResourceLabels(labels)
	if !collectionStartTime.Before(timestamp) {
		glog.V(4).Infof("Error translating metric %v for pod %v: batch timestamp %v earlier than pod create time %v", name, labels["pod_name"], timestamp, collectionStartTime)
		return nil
	}
	switch name {
	case core.MetricUptime.MetricDescriptor.Name:
		doubleValue := float64(value.IntValue) / float64(time.Second/time.Millisecond)
		point := sink.doublePoint(timestamp, collectionStartTime, doubleValue)
		return legacyCreateTimeSeries(resourceLabels, legacyUptimeMD, point)
	case core.MetricCpuLimit.MetricDescriptor.Name:
		// converting from millicores to cores
		point := sink.doublePoint(timestamp, timestamp, float64(value.IntValue)/1000)
		return legacyCreateTimeSeries(resourceLabels, legacyCPUReservedCoresMD, point)
	case core.MetricCpuUsage.MetricDescriptor.Name:
		point := sink.doublePoint(timestamp, collectionStartTime, float64(value.IntValue)/float64(time.Second/time.Nanosecond))
		return legacyCreateTimeSeries(resourceLabels, legacyCPUUsageTimeMD, point)
	case core.MetricNetworkRx.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
		return legacyCreateTimeSeries(resourceLabels, legacyNetworkRxMD, point)
	case core.MetricNetworkTx.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
		return legacyCreateTimeSeries(resourceLabels, legacyNetworkTxMD, point)
	case core.MetricMemoryLimit.MetricDescriptor.Name:
		// omit nodes, using memory/node_allocatable instead
		if labels["type"] == core.MetricSetTypeNode {
			return nil
		}
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		return legacyCreateTimeSeries(resourceLabels, legacyMemoryLimitMD, point)
	case core.MetricNodeMemoryAllocatable.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		return legacyCreateTimeSeries(resourceLabels, legacyMemoryLimitMD, point)
	case core.MetricMemoryMajorPageFaults.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyMemoryPageFaultsMD, point)
		ts.Metric.Labels = map[string]string{
			"fault_type": "major",
		}
		return ts
	case "memory/bytes_used":
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyMemoryBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"memory_type": "evictable",
		}
		return ts
	case core.MetricMemoryWorkingSet.MetricDescriptor.Name:
		point := sink.intPoint(timestamp, timestamp, value.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyMemoryBytesUsedMD, point)
		ts.Metric.Labels = map[string]string{
			"memory_type": "non-evictable",
		}
		return ts
	case "memory/minor_page_faults":
		point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
		ts := legacyCreateTimeSeries(resourceLabels, legacyMemoryPageFaultsMD, point)
		ts.Metric.Labels = map[string]string{
			"fault_type": "minor",
		}
		return ts
	}
	return nil
}

func (sink *StackdriverSink) TranslateLabeledMetric(timestamp time.Time, labels map[string]string, metric core.LabeledMetric, collectionStartTime time.Time) *monitoringpb.TimeSeries {
	switch labels["type"] {
	case core.MetricSetTypePod:
		podLabels := sink.getPodResourceLabels(labels)
		switch metric.Name {
		case core.MetricFilesystemUsage.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, metric.MetricValue.IntValue)
			ts := createTimeSeries("k8s_pod", podLabels, volumeUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				core.LabelVolumeName.Key: strings.TrimPrefix(metric.Labels[core.LabelResourceID.Key], "Volume:"),
			}
			return ts
		case core.MetricFilesystemLimit.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, metric.MetricValue.IntValue)
			ts := createTimeSeries("k8s_pod", podLabels, volumeTotalBytesMD, point)
			ts.Metric.Labels = map[string]string{
				core.LabelVolumeName.Key: strings.TrimPrefix(metric.Labels[core.LabelResourceID.Key], "Volume:"),
			}
			return ts
		}
	}
	return nil
}

func (sink *StackdriverSink) TranslateMetric(timestamp time.Time, labels map[string]string, name string, value core.MetricValue, collectionStartTime time.Time, entityCreateTime time.Time) *monitoringpb.TimeSeries {
	if !collectionStartTime.Before(timestamp) {
		glog.V(4).Infof("Error translating metric %v for pod %v: batch timestamp %v earlier than pod create time %v", name, labels["pod_name"], timestamp, collectionStartTime)
		return nil
	}
	switch labels["type"] {
	case core.MetricSetTypePodContainer:
		containerLabels := sink.getContainerResourceLabels(labels)
		switch name {
		case core.MetricUptime.MetricDescriptor.Name:
			doubleValue := float64(value.IntValue) / float64(time.Second/time.Millisecond)
			point := sink.doublePoint(timestamp, timestamp, doubleValue)
			return createTimeSeries("k8s_container", containerLabels, containerUptimeMD, point)
		case core.MetricCpuLimit.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, timestamp, float64(value.IntValue)/1000)
			return createTimeSeries("k8s_container", containerLabels, cpuLimitCoresMD, point)
		case core.MetricCpuRequest.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, timestamp, float64(value.IntValue)/1000)
			return createTimeSeries("k8s_container", containerLabels, cpuRequestedCoresMD, point)
		case core.MetricCpuUsage.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, collectionStartTime, float64(value.IntValue)/float64(time.Second/time.Nanosecond))
			return createTimeSeries("k8s_container", containerLabels, cpuContainerCoreUsageTimeMD, point)
		case core.MetricMemoryLimit.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			return createTimeSeries("k8s_container", containerLabels, memoryLimitBytesMD, point)
		case "memory/bytes_used":
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_container", containerLabels, memoryContainerUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"memory_type": "evictable",
			}
			return ts
		case core.MetricMemoryWorkingSet.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_container", containerLabels, memoryContainerUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"memory_type": "non-evictable",
			}
			return ts
		case core.MetricMemoryRequest.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			return createTimeSeries("k8s_container", containerLabels, memoryRequestedBytesMD, point)
		case core.MetricRestartCount.MetricDescriptor.Name:
			if entityCreateTime.IsZero() {
				glog.V(2).Infof("Skipping restart_count metric for container %s because entity create time is zero", core.PodContainerKey(containerLabels["namespace_name"], containerLabels["pod_name"], containerLabels["container_name"]))
				return nil
			}
			point := sink.intPoint(timestamp, entityCreateTime, value.IntValue)
			return createTimeSeries("k8s_container", containerLabels, restartCountMD, point)
		}
	case core.MetricSetTypePod:
		podLabels := sink.getPodResourceLabels(labels)
		switch name {
		case core.MetricNetworkRx.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
			return createTimeSeries("k8s_pod", podLabels, networkPodReceivedBytesMD, point)
		case core.MetricNetworkTx.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
			return createTimeSeries("k8s_pod", podLabels, networkPodSentBytesMD, point)
		}
	case core.MetricSetTypeNode:
		nodeLabels := sink.getNodeResourceLabels(labels)
		switch name {
		case core.MetricNodeCpuCapacity.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, timestamp, float64(value.FloatValue)/1000)
			return createTimeSeries("k8s_node", nodeLabels, cpuTotalCoresMD, point)
		case core.MetricNodeCpuAllocatable.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, timestamp, float64(value.FloatValue)/1000)
			return createTimeSeries("k8s_node", nodeLabels, cpuAllocatableCoresMD, point)
		case core.MetricCpuUsage.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, collectionStartTime, float64(value.IntValue)/float64(time.Second/time.Nanosecond))
			return createTimeSeries("k8s_node", nodeLabels, cpuNodeCoreUsageTimeMD, point)
		case core.MetricNodeMemoryCapacity.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, int64(value.FloatValue))
			return createTimeSeries("k8s_node", nodeLabels, memoryTotalBytesMD, point)
		case core.MetricNodeMemoryAllocatable.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, int64(value.FloatValue))
			return createTimeSeries("k8s_node", nodeLabels, memoryAllocatableBytesMD, point)
		case "memory/bytes_used":
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_node", nodeLabels, memoryNodeUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"memory_type": "evictable",
			}
			return ts
		case core.MetricMemoryWorkingSet.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_node", nodeLabels, memoryNodeUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"memory_type": "non-evictable",
			}
			return ts
		case core.MetricNetworkRx.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
			return createTimeSeries("k8s_node", nodeLabels, networkNodeReceivedBytesMD, point)
		case core.MetricNetworkTx.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, collectionStartTime, value.IntValue)
			return createTimeSeries("k8s_node", nodeLabels, networkNodeSentBytesMD, point)
		}
	case core.MetricSetTypeSystemContainer:
		nodeLabels := sink.getNodeResourceLabels(labels)
		switch name {
		case "memory/bytes_used":
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_node", nodeLabels, memoryNodeDaemonUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"component":   labels[core.LabelContainerName.Key],
				"memory_type": "evictable",
			}
			return ts
		case core.MetricMemoryWorkingSet.MetricDescriptor.Name:
			point := sink.intPoint(timestamp, timestamp, value.IntValue)
			ts := createTimeSeries("k8s_node", nodeLabels, memoryNodeDaemonUsedBytesMD, point)
			ts.Metric.Labels = map[string]string{
				"component":   labels[core.LabelContainerName.Key],
				"memory_type": "non-evictable",
			}
			return ts
		case core.MetricCpuUsage.MetricDescriptor.Name:
			point := sink.doublePoint(timestamp, collectionStartTime, float64(value.IntValue)/float64(time.Second/time.Nanosecond))
			ts := createTimeSeries("k8s_node", nodeLabels, cpuNodeDaemonCoreUsageTimeMD, point)
			ts.Metric.Labels = map[string]string{
				"component": labels[core.LabelContainerName.Key],
			}
			return ts
		}
	}
	return nil
}

func (sink *StackdriverSink) legacyGetResourceLabels(labels map[string]string) map[string]string {
	return map[string]string{
		"project_id":     sink.project,
		"cluster_name":   sink.clusterName,
		"zone":           sink.heapsterZone,
		"instance_id":    labels[core.LabelHostID.Key],
		"namespace_id":   labels[core.LabelPodNamespaceUID.Key],
		"pod_id":         labels[core.LabelPodId.Key],
		"container_name": labels[core.LabelContainerName.Key],
	}
}

func (sink *StackdriverSink) getContainerResourceLabels(labels map[string]string) map[string]string {
	return map[string]string{
		"project_id":     sink.project,
		"location":       sink.clusterLocation,
		"cluster_name":   sink.clusterName,
		"namespace_name": labels[core.LabelNamespaceName.Key],
		"pod_name":       labels[core.LabelPodName.Key],
		"container_name": labels[core.LabelContainerName.Key],
	}
}

func (sink *StackdriverSink) getPodResourceLabels(labels map[string]string) map[string]string {
	return map[string]string{
		"project_id":     sink.project,
		"location":       sink.clusterLocation,
		"cluster_name":   sink.clusterName,
		"namespace_name": labels[core.LabelNamespaceName.Key],
		"pod_name":       labels[core.LabelPodName.Key],
	}
}

func (sink *StackdriverSink) getNodeResourceLabels(labels map[string]string) map[string]string {
	return map[string]string{
		"project_id":   sink.project,
		"location":     sink.clusterLocation,
		"cluster_name": sink.clusterName,
		"node_name":    labels[core.LabelNodename.Key],
	}
}

func legacyCreateTimeSeries(resourceLabels map[string]string, metadata *metricMetadata, point *monitoringpb.Point) *monitoringpb.TimeSeries {
	return createTimeSeries("gke_container", resourceLabels, metadata, point)
}

func createTimeSeries(resource string, resourceLabels map[string]string, metadata *metricMetadata, point *monitoringpb.Point) *monitoringpb.TimeSeries {
	return &monitoringpb.TimeSeries{
		Metric: &metric.Metric{
			Type: metadata.Name,
		},
		MetricKind: metadata.MetricKind,
		ValueType:  metadata.ValueType,
		Resource: &monitoredres.MonitoredResource{
			Labels: resourceLabels,
			Type:   resource,
		},
		Points: []*monitoringpb.Point{point},
	}
}

func (sink *StackdriverSink) doublePoint(endTime time.Time, startTime time.Time, value float64) *monitoringpb.Point {
	return &monitoringpb.Point{
		Interval: &monitoringpb.TimeInterval{
			EndTime:   &google_proto.Timestamp{Seconds: endTime.Unix(), Nanos: int32(endTime.Nanosecond())},
			StartTime: &google_proto.Timestamp{Seconds: startTime.Unix(), Nanos: int32(startTime.Nanosecond())},
		},
		Value: &monitoringpb.TypedValue{
			Value: &monitoringpb.TypedValue_DoubleValue{
				DoubleValue: value,
			},
		},
	}

}

func (sink *StackdriverSink) intPoint(endTime time.Time, startTime time.Time, value int64) *monitoringpb.Point {
	return &monitoringpb.Point{
		Interval: &monitoringpb.TimeInterval{
			EndTime:   &google_proto.Timestamp{Seconds: endTime.Unix(), Nanos: int32(endTime.Nanosecond())},
			StartTime: &google_proto.Timestamp{Seconds: startTime.Unix(), Nanos: int32(startTime.Nanosecond())},
		},
		Value: &monitoringpb.TypedValue{
			Value: &monitoringpb.TypedValue_Int64Value{
				Int64Value: value,
			},
		},
	}
}

func fullProjectName(name string) string {
	return fmt.Sprintf("projects/%s", name)
}

func getReq(project string) *monitoringpb.CreateTimeSeriesRequest {
	return &monitoringpb.CreateTimeSeriesRequest{
		TimeSeries: nil,
		Name:       fullProjectName(project),
	}
}
