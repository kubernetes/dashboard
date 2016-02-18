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
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"log"
	"strings"
)

// Partial string to correctly filter warning events.
// Has to be lower case for correct case insensitive comparison.
const FailedReasonPartial = "failed"

// Returns warning pod events based on given list of pods.
// TODO(floreks) : Import and use Set instead of custom function to get rid of duplicates
func GetPodsEventWarnings(client client.Interface, pods []api.Pod) (result []Event, err error) {
	for _, pod := range pods {
		if !isRunningOrSucceeded(pod) {
			log.Printf("Getting warning events from pod: %s", pod.Name)
			events, err := GetPodEvents(client, pod)

			if err != nil {
				return nil, err
			}

			result = getPodsEventWarnings(events)
		}
	}

	return removeDuplicates(result), nil
}

// Returns list of Pod Event model objects based on kubernetes API event list object
// Event list object is filtered to get only warning events.
func getPodsEventWarnings(eventList *api.EventList) []Event {
	result := make([]Event, 0)

	var events []api.Event
	if !isTypeFilled(eventList.Items) {
		eventList.Items = fillEventsType(eventList.Items)
	}

	events = filterEventsByType(eventList.Items, api.EventTypeWarning)

	for _, event := range events {
		result = append(result, Event{
			Message: event.Message,
			Reason:  event.Reason,
			Type:    event.Type,
		})
	}

	return result
}

// Filters kubernetes API event objects based on event type.
// Empty string will return all events.
func filterEventsByType(events []api.Event, eventType string) []api.Event {
	if len(eventType) == 0 || len(events) == 0 {
		return events
	}

	result := make([]api.Event, 0)
	for _, event := range events {
		if event.Type == eventType {
			result = append(result, event)
		}
	}

	return result
}

// Returns true if all given events type is filled, false otherwise.
// This is needed as some older versions of kubernetes do not have Type property filled.
func isTypeFilled(events []api.Event) bool {
	if len(events) == 0 {
		return false
	}

	for _, event := range events {
		if len(event.Type) == 0 {
			return false
		}
	}

	return true
}

// Based on event Reason fills event Type in order to allow correct filtering by Type.
func fillEventsType(events []api.Event) []api.Event {
	for i, _ := range events {
		if strings.Contains(strings.ToLower(events[i].Reason), FailedReasonPartial) {
			events[i].Type = api.EventTypeWarning
		} else {
			events[i].Type = api.EventTypeNormal
		}
	}

	return events
}

// Removes duplicate strings from the slice
func removeDuplicates(slice []Event) []Event {
	visited := make(map[string]bool, 0)
	result := make([]Event, 0)

	for _, elem := range slice {
		if !visited[elem.Reason] {
			visited[elem.Reason] = true
			result = append(result, elem)
		}
	}

	return result
}

// Returns true if given pod is in state running or succeeded, false otherwise
func isRunningOrSucceeded(pod api.Pod) bool {
	switch pod.Status.Phase {
	case api.PodRunning, api.PodSucceeded:
		return true
	}

	return false
}
