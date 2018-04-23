// Copyright 2014 Google Inc. All Rights Reserved.
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

package riemann

import (
	"net/url"
	"sync"

	"github.com/golang/glog"
	"github.com/riemann/riemann-go-client"
	riemannCommon "k8s.io/heapster/common/riemann"
	"k8s.io/heapster/metrics/core"
)

// contains the riemann client, the riemann configuration, and a RWMutex
type RiemannSink struct {
	client riemanngo.Client
	config riemannCommon.RiemannConfig
	sync.RWMutex
}

// creates a Riemann sink. Returns a riemannSink
func CreateRiemannSink(uri *url.URL) (core.DataSink, error) {
	var sink, err = riemannCommon.CreateRiemannSink(uri)
	if err != nil {
		glog.Warningf("Error creating the Riemann metrics sink: %v", err)
		return nil, err
	}
	rs := &RiemannSink{
		client: sink.Client,
		config: sink.Config,
	}
	return rs, nil
}

// Return a user-friendly string describing the sink
func (sink *RiemannSink) Name() string {
	return "Riemann Sink"
}

func (sink *RiemannSink) Stop() {
	// nothing needs to be done.
}

// Receives a list of riemanngo.Event, the sink, and parameters.
// Creates a new event using the parameters and the sink config, and add it into the Event list.
// Can send events if events is full
// Return the list.
func appendEvent(events []riemanngo.Event, sink *RiemannSink, host, name string, value interface{}, labels map[string]string, timestamp int64) []riemanngo.Event {
	event := riemanngo.Event{
		Time:        timestamp,
		Service:     name,
		Host:        host,
		Description: "",
		Attributes:  labels,
		Metric:      value,
		Ttl:         sink.config.Ttl,
		State:       sink.config.State,
		Tags:        sink.config.Tags,
	}
	// state everywhere
	events = append(events, event)
	if len(events) >= sink.config.BatchSize {
		err := riemannCommon.SendData(sink.client, events)
		if err != nil {
			glog.Warningf("Error sending events to Riemann: ", err)
			// client will reconnect later
			sink.client = nil
		}
		events = nil
	}
	return events
}

// ExportData Send a collection of Timeseries to Riemann
func (sink *RiemannSink) ExportData(dataBatch *core.DataBatch) {
	sink.Lock()
	defer sink.Unlock()

	if sink.client == nil {
		// the client could be nil here, so we reconnect
		client, err := riemannCommon.GetRiemannClient(sink.config)
		if err != nil {
			glog.Warningf("Riemann sink not connected: %v", err)
			return
		}
		sink.client = client
	}

	var events []riemanngo.Event

	for _, metricSet := range dataBatch.MetricSets {
		host := metricSet.Labels[core.LabelHostname.Key]
		for metricName, metricValue := range metricSet.MetricValues {
			if value := metricValue.GetValue(); value != nil {
				timestamp := dataBatch.Timestamp.Unix()
				// creates an event and add it to dataEvent
				events = appendEvent(events, sink, host, metricName, value, metricSet.Labels, timestamp)
			}
		}
		for _, metric := range metricSet.LabeledMetrics {
			if value := metric.GetValue(); value != nil {
				labels := make(map[string]string)
				for k, v := range metricSet.Labels {
					labels[k] = v
				}
				for k, v := range metric.Labels {
					labels[k] = v
				}
				timestamp := dataBatch.Timestamp.Unix()
				// creates an event and add it to dataEvent
				events = appendEvent(events, sink, host, metric.Name, value, labels, timestamp)
			}
		}
	}
	// Send events to Riemann if events is not empty
	if len(events) > 0 {
		err := riemannCommon.SendData(sink.client, events)
		if err != nil {
			glog.Warningf("Error sending events to Riemann: ", err)
			// client will reconnect later
			sink.client = nil
		}
	}
}
