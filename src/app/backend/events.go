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

// Return events for particular namespace and replication controller or error if occurred.
func GetEvents(client *client.Client, namespace, replicationControllerName string) (*Events, error) {
	log.Printf("Getting events related to %s replication controller in %s namespace", replicationControllerName,
		namespace)

	// Get events for replication controller.
	rsEvents, err := GetReplicationControllerEvents(client, namespace, replicationControllerName)

	if err != nil {
		return nil, err
	}

	events := AppendEvents(rsEvents, Events{
		Namespace: namespace,
		Events:    make([]Event, 0),
	})

	// Get events for pods in replication controller.
	podEvents, err := GetReplicationControllerPodsEvents(client, namespace, replicationControllerName)

	if err != nil {
		return nil, err
	}

	events = AppendEvents(podEvents, events)

	log.Printf("Found %d events related to %s replication controller in %s namespace", len(events.Events),
		replicationControllerName, namespace)

	return &events, nil
}

// Gets events associated to replication controller.
func GetReplicationControllerEvents(client *client.Client, namespace, replicationControllerName string) ([]api.Event,
	error) {
	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + replicationControllerName)

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

// Gets events associated to pods in replication controller.
func GetReplicationControllerPodsEvents(client *client.Client, namespace, replicationControllerName string) ([]api.Event,
	error) {
	replicationController, err := client.ReplicationControllers(namespace).Get(replicationControllerName)

	if err != nil {
		return nil, err
	}

	pods, err := client.Pods(namespace).List(unversioned.ListOptions{
		LabelSelector: unversioned.LabelSelector{labels.SelectorFromSet(replicationController.Spec.Selector)},
		FieldSelector: unversioned.FieldSelector{fields.Everything()},
	})

	if err != nil {
		return nil, err
	}

	events, err := GetPodsEvents(client, pods)

	if err != nil {
		return nil, err
	}

	return events, nil
}

// Gets events associated to given list of pods
// TODO(floreks): refactor this to make single API call instead of N api calls
func GetPodsEvents(client *client.Client, pods *api.PodList) ([]api.Event, error) {
	events := make([]api.Event, 0, 0)

	for _, pod := range pods.Items {
		list, err := GetPodEvents(client, pod)

		if err != nil {
			return nil, err
		}

		for _, event := range list.Items {
			events = append(events, event)
		}

	}

	return events, nil
}

// Gets events associated to given pod
func GetPodEvents(client client.Interface, pod api.Pod) (*api.EventList, error) {
	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + pod.Name)

	if err != nil {
		return nil, err
	}

	list, err := client.Events(pod.Namespace).List(unversioned.ListOptions{
		LabelSelector: unversioned.LabelSelector{labels.Everything()},
		FieldSelector: unversioned.FieldSelector{fieldSelector},
	})

	if err != nil {
		return nil, err
	}

	return list, nil
}

// Appends events from source slice to target events representation.
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
