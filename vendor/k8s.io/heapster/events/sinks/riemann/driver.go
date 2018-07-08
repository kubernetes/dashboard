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

package riemann

import (
	"net/url"
	"strconv"
	"strings"
	"sync"

	"github.com/golang/glog"
	"github.com/riemann/riemann-go-client"
	kube_api "k8s.io/client-go/pkg/api/v1"
	riemannCommon "k8s.io/heapster/common/riemann"
	"k8s.io/heapster/events/core"
)

// contains the riemann client, the riemann configuration, and a RWMutex
type RiemannSink struct {
	client riemanngo.Client
	config riemannCommon.RiemannConfig
	sync.RWMutex
}

// creates a Riemann sink. Returns a riemannSink
func CreateRiemannSink(uri *url.URL) (core.EventSink, error) {
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
	sink.client.Close()
}

func getEventState(event *kube_api.Event) string {
	switch event.Type {
	case "Normal":
		return "ok"
	case "Warning":
		return "warning"
	default:
		return "warning"
	}
}

func appendEvent(events []riemanngo.Event, sink *RiemannSink, event *kube_api.Event, timestamp int64) []riemanngo.Event {
	firstTimestamp := ""
	lastTimestamp := ""
	if !event.FirstTimestamp.IsZero() {
		firstTimestamp = strconv.FormatInt(event.FirstTimestamp.Unix(), 10)
	}
	if !event.LastTimestamp.IsZero() {
		lastTimestamp = strconv.FormatInt(event.LastTimestamp.Unix(), 10)
	}
	riemannEvent := riemanngo.Event{
		Time:        timestamp,
		Service:     strings.Join([]string{event.InvolvedObject.Kind, event.Reason}, "."),
		Host:        event.Source.Host,
		Description: event.Message,
		Attributes: map[string]string{
			"namespace":        event.InvolvedObject.Namespace,
			"uid":              string(event.InvolvedObject.UID),
			"name":             event.InvolvedObject.Name,
			"api-version":      event.InvolvedObject.APIVersion,
			"resource-version": event.InvolvedObject.ResourceVersion,
			"field-path":       event.InvolvedObject.FieldPath,
			"component":        event.Source.Component,
			"last-timestamp":   lastTimestamp,
			"first-timestamp":  firstTimestamp,
		},
		Metric: event.Count,
		Ttl:    sink.config.Ttl,
		State:  getEventState(event),
		Tags:   sink.config.Tags,
	}

	events = append(events, riemannEvent)
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

func (sink *RiemannSink) ExportEvents(eventBatch *core.EventBatch) {
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

	for _, event := range eventBatch.Events {
		timestamp := eventBatch.Timestamp.Unix()
		// creates an event and add it to dataEvent
		events = appendEvent(events, sink, event, timestamp)
	}

	if len(events) > 0 {
		err := riemannCommon.SendData(sink.client, events)
		if err != nil {
			glog.Warningf("Error sending events to Riemann: ", err)
			// client will reconnect later
			sink.client = nil
		}
		events = nil
	}
}
