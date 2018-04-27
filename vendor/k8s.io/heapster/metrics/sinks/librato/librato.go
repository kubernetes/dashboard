// Copyright 2017 Google Inc. All Rights Reserved.
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

package librato

import (
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"

	librato_common "k8s.io/heapster/common/librato"
	"k8s.io/heapster/metrics/core"

	"github.com/golang/glog"
)

type libratoSink struct {
	client librato_common.Client
	sync.RWMutex
	c librato_common.LibratoConfig
}

const (
	// Value Field name
	valueField = "value"

	// Maximum number of librato measurements to be sent in one batch.
	maxSendBatchSize = 1000

	// Librato measurement restrictions
	// https://www.librato.com/docs/api/#measurement-restrictions
	maxMeasurementNameLength = 255
	maxTagNameLength         = 64
	maxTagValueLength        = 255
)

var (
	// Librato measurement restrictions
	// https://www.librato.com/docs/api/#measurement-restrictions
	invalidMeasurementNameRegexp = regexp.MustCompile("[^A-Za-z0-9.:-_]")
	invalidTagNameRegex          = regexp.MustCompile("[^-.:_\\w]")
	invalidTagValueRegex         = regexp.MustCompile("[^-.:_\\w ]")
)

func (sink *libratoSink) formatMeasurementName(metricName string) string {
	measurementName := strings.Replace(metricName, "/", ".", -1)
	name := sink.c.Prefix + measurementName

	return sink.trunc(invalidMeasurementNameRegexp.ReplaceAllString(name, "_"), maxMeasurementNameLength)
}

func (sink *libratoSink) formatTagName(tagName string) string {
	return sink.trunc(invalidTagNameRegex.ReplaceAllString(tagName, "_"), maxTagNameLength)
}

func (sink *libratoSink) formatTagValue(tagName string) string {
	return sink.trunc(invalidTagValueRegex.ReplaceAllString(tagName, "_"), maxTagValueLength)
}

func (sink *libratoSink) trunc(val string, length int) string {
	if len(val) <= length {
		return val
	}

	return val[:length]
}

func (sink *libratoSink) ExportData(dataBatch *core.DataBatch) {
	sink.Lock()
	defer sink.Unlock()

	measurements := make([]librato_common.Measurement, 0, 0)
	for _, metricSet := range dataBatch.MetricSets {
		for metricName, metricValue := range metricSet.MetricValues {

			var value float64
			if core.ValueInt64 == metricValue.ValueType {
				value = float64(metricValue.IntValue)
			} else if core.ValueFloat == metricValue.ValueType {
				value = float64(metricValue.FloatValue)
			} else {
				continue
			}

			name := sink.formatMeasurementName(metricName)
			measurement := librato_common.Measurement{
				Name:  name,
				Tags:  make(map[string]string),
				Time:  dataBatch.Timestamp.Unix(),
				Value: value,
			}

			for key, value := range metricSet.Labels {
				measurement.Tags[sink.formatTagName(key)] = sink.formatTagValue(value)
			}

			measurements = append(measurements, measurement)
			if len(measurements) >= maxSendBatchSize {
				sink.sendData(measurements)
				measurements = make([]librato_common.Measurement, 0, 0)
			}
		}

		for _, labeledMetric := range metricSet.LabeledMetrics {

			var value float64
			if core.ValueInt64 == labeledMetric.ValueType {
				value = float64(labeledMetric.IntValue)
			} else if core.ValueFloat == labeledMetric.ValueType {
				value = float64(labeledMetric.FloatValue)
			} else {
				continue
			}

			// Prepare measurement without fields
			name := sink.formatMeasurementName(labeledMetric.Name)
			measurement := librato_common.Measurement{
				Name:  name,
				Tags:  make(map[string]string),
				Time:  dataBatch.Timestamp.Unix(),
				Value: value,
			}
			for key, value := range metricSet.Labels {
				measurement.Tags[sink.formatTagName(key)] = sink.formatTagValue(value)
			}
			for key, value := range labeledMetric.Labels {
				measurement.Tags[sink.formatTagName(key)] = sink.formatTagValue(value)
			}

			measurements = append(measurements, measurement)
			if len(measurements) >= maxSendBatchSize {
				sink.sendData(measurements)
				measurements = make([]librato_common.Measurement, 0, 0)
			}
		}
	}
	if len(measurements) >= 0 {
		sink.sendData(measurements)
	}
}

func (sink *libratoSink) sendData(measurements []librato_common.Measurement) {
	start := time.Now()
	if err := sink.client.Write(measurements); err != nil {
		glog.Errorf("Librato write failed: %v", err)
	}
	end := time.Now()
	glog.V(4).Infof("Exported %d data to librato in %s", len(measurements), end.Sub(start))
}

func (sink *libratoSink) Name() string {
	return "Librato Sink"
}

func (sink *libratoSink) Stop() {
	// nothing needs to be done.
}

func CreateLibratoSink(uri *url.URL) (core.DataSink, error) {
	config, err := librato_common.BuildConfig(uri)
	if err != nil {
		return nil, err
	}
	client := librato_common.NewClient(*config)
	sink := &libratoSink{
		client: client,
		c:      *config,
	}
	glog.Infof("created librato sink with options: user:%s", config.Username)
	return sink, nil
}
