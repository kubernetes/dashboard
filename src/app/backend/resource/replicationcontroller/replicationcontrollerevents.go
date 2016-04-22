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

package replicationcontroller

import (
	"log"

	. "github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// GetEvents returns events for particular namespace and replication controller or error if occurred.
func GetEvents(client *client.Client, namespace, replicationControllerName string) (*Events, error) {
	log.Printf("Getting events related to %s replication controller in %s namespace", replicationControllerName,
		namespace)

	// Get events for replication controller.
	rsEvents, err := GetReplicationControllerEvents(client, namespace, replicationControllerName)

	if err != nil {
		return nil, err
	}

	// Get events for pods in replication controller.
	podEvents, err := GetReplicationControllerPodsEvents(client, namespace, replicationControllerName)

	if err != nil {
		return nil, err
	}

	apiEvents := append(rsEvents, podEvents...)

	if !IsTypeFilled(apiEvents) {
		apiEvents = FillEventsType(apiEvents)
	}

	events := AppendEvents(apiEvents, Events{
		Namespace: namespace,
		Events:    make([]Event, 0),
	})

	log.Printf("Found %d events related to %s replication controller in %s namespace", len(events.Events),
		replicationControllerName, namespace)

	return &events, nil
}

// GetReplicationControllerEvents gets events associated to replication controller.
func GetReplicationControllerEvents(client *client.Client, namespace, replicationControllerName string) ([]api.Event,
	error) {
	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + replicationControllerName)

	if err != nil {
		return nil, err
	}

	list, err := client.Events(namespace).List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fieldSelector,
	})

	if err != nil {
		return nil, err
	}

	return list.Items, nil
}

// GetReplicationControllerPodsEvents gets events associated to pods in replication controller.
func GetReplicationControllerPodsEvents(client *client.Client, namespace, replicationControllerName string) ([]api.Event,
	error) {
	replicationController, err := client.ReplicationControllers(namespace).Get(replicationControllerName)

	if err != nil {
		return nil, err
	}

	pods, err := client.Pods(namespace).List(api.ListOptions{
		LabelSelector: labels.SelectorFromSet(replicationController.Spec.Selector),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	eventList, err := client.Events(namespace).List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	events := FilterEventsByPodsUID(eventList.Items, pods.Items)

	return events, nil
}

// AppendEvents appends events from source slice to target events representation.
func AppendEvents(source []api.Event, target Events) Events {
	for _, event := range source {
		target.Events = append(target.Events, Event{
			Message:         event.Message,
			SourceComponent: event.Source.Component,
			SourceHost:      event.Source.Host,
			SubObject:       event.InvolvedObject.FieldPath,
			Count:           event.Count,
			FirstSeen:       event.FirstTimestamp,
			LastSeen:        event.LastTimestamp,
			Reason:          event.Reason,
			Type:            event.Type,
		})
	}
	return target
}
