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

package main

import (
	"log"

	api "k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// Events response structure.
type Events struct {
	// Namespace.
	Namespace string `json:"namespace"`

	// List of events from given namespace.
	Events []Event `json:"events"`
}

// Single event representation.
type Event struct {
	// Event message.
	Message string `json:"message"`

	// Component from which the event is generated.
	SourceComponent string `json:"sourceComponent"`

	// Host name on which the event is generated.
	SourceHost string `json:"sourceHost"`

	// Reference to a piece of an object, which triggered an event. For example
	// "spec.containers{name}" refers to container within pod with given name, if no container
	// name is specified, for example "spec.containers[2]", then it refers to container with
	// index 2 in this pod.
	SubObject string `json:"object"`

	// The number of times this event has occurred.
	Count int `json:"count"`

	// The time at which the event was first recorded.
	FirstSeen unversioned.Time `json:"firstSeen"`

	// The time at which the most recent occurrence of this event was recorded.
	LastSeen unversioned.Time `json:"lastSeen"`

	// Reason why this event was generated.
	Reason string `json:"reason"`

	// Event type (at the moment only normal and warning are supported).
	Type string `json:"type"`
}

// Return events for particular namespace and replica set or error if occurred.
func GetEvents(client *client.Client, namespace, replicaSetName string) (*Events, error) {
	log.Printf("Getting events related to %s replica set in %s namespace", replicaSetName,
		namespace)

	// Get events for replica set.
	rsEvents, err := GetReplicaSetEvents(client, namespace, replicaSetName)

	if err != nil {
		return nil, err
	}

	events := AppendEvents(rsEvents, Events{
		Namespace: namespace,
		Events:    make([]Event, 0),
	})

	// Get events for pods in replica set.
	podEvents, err := GetReplicaSetPodsEvents(client, namespace, replicaSetName)

	if err != nil {
		return nil, err
	}

	events = AppendEvents(podEvents, events)

	log.Printf("Found %d events related to %s replica set in %s namespace", len(events.Events),
		replicaSetName, namespace)

	return &events, nil
}

// Gets events associated to replica set.
func GetReplicaSetEvents(client *client.Client, namespace, replicaSetName string) ([]api.Event,
	error) {
	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + replicaSetName)

	if err != nil {
		return nil, err
	}

	list, err := client.Events(namespace).List(unversioned.ListOptions{
		LabelSelector: unversioned.LabelSelector{labels.Everything()},
		FieldSelector: unversioned.FieldSelector{fieldSelector},
	})

	if err != nil {
		return nil, err
	}

	return list.Items, nil
}

// Gets events associated to pods in replica set.
func GetReplicaSetPodsEvents(client *client.Client, namespace, replicaSetName string) ([]api.Event,
	error) {
	replicaSet, err := client.ReplicationControllers(namespace).Get(replicaSetName)

	if err != nil {
		return nil, err
	}

	pods, err := client.Pods(namespace).List(unversioned.ListOptions{
		LabelSelector: unversioned.LabelSelector{labels.SelectorFromSet(replicaSet.Spec.Selector)},
		FieldSelector: unversioned.FieldSelector{fields.Everything()},
	})

	if err != nil {
		return nil, err
	}

	events := make([]api.Event, 0, 0)

	for _, pod := range pods.Items {
		fieldSelector, err := fields.ParseSelector("involvedObject.name=" + pod.Name)

		if err != nil {
			return nil, err
		}

		list, err := client.Events(namespace).List(unversioned.ListOptions{
			LabelSelector: unversioned.LabelSelector{labels.Everything()},
			FieldSelector: unversioned.FieldSelector{fieldSelector},
		})

		if err != nil {
			return nil, err
		}

		for _, event := range list.Items {
			events = append(events, event)
		}

	}

	return events, nil
}

// Appends events from source slice to target events representation.
// TODO(maciaszczykm): Append information about event source (user, system etc.).
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
