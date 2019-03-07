// Copyright 2017 The Kubernetes Authors.
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

package event

import (
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	api "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
)

// FailedReasonPartials  is an array of partial strings to correctly filter warning events.
// Have to be lower case for correct case insensitive comparison.
// Based on k8s official events reason file:
// https://github.com/kubernetes/kubernetes/blob/886e04f1fffbb04faf8a9f9ee141143b2684ae68/pkg/kubelet/events/event.go
// Partial strings that are not in event.go file are added in order to support
// older versions of k8s which contained additional event reason messages.
var FailedReasonPartials = []string{"failed", "err", "exceeded", "invalid", "unhealthy",
	"mismatch", "insufficient", "conflict", "outof", "nil", "backoff"}

// GetPodsEventWarnings returns warning pod events by filtering out events targeting only given pods
func GetPodsEventWarnings(events []api.Event, pods []api.Pod) []common.Event {
	result := make([]common.Event, 0)

	// Filter out only warning events
	events = getWarningEvents(events)
	failedPods := make([]api.Pod, 0)

	// Filter out ready and successful pods
	for _, pod := range pods {
		if !isReadyOrSucceeded(pod) {
			failedPods = append(failedPods, pod)
		}
	}

	// Filter events by failed pods UID
	events = filterEventsByPodsUID(events, failedPods)
	events = removeDuplicates(events)

	for _, event := range events {
		result = append(result, common.Event{
			Message: event.Message,
			Reason:  event.Reason,
			Type:    event.Type,
		})
	}

	return result
}

// Returns filtered list of event objects. Events list is filtered to get only events targeting
// pods on the list.
func filterEventsByPodsUID(events []api.Event, pods []api.Pod) []api.Event {
	result := make([]api.Event, 0)
	podEventMap := make(map[types.UID]bool, 0)

	if len(pods) == 0 || len(events) == 0 {
		return result
	}

	for _, pod := range pods {
		podEventMap[pod.UID] = true
	}

	for _, event := range events {
		if _, exists := podEventMap[event.InvolvedObject.UID]; exists {
			result = append(result, event)
		}
	}

	return result
}

// Returns filtered list of event objects.
// Event list object is filtered to get only warning events.
func getWarningEvents(events []api.Event) []api.Event {
	return filterEventsByType(FillEventsType(events), api.EventTypeWarning)
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

// Returns true if reason string contains any partial string indicating that this may be a
// warning, false otherwise
func isFailedReason(reason string, partials ...string) bool {
	for _, partial := range partials {
		if strings.Contains(strings.ToLower(reason), partial) {
			return true
		}
	}

	return false
}

// Removes duplicate strings from the slice
func removeDuplicates(slice []api.Event) []api.Event {
	visited := make(map[string]bool, 0)
	result := make([]api.Event, 0)

	for _, elem := range slice {
		if !visited[elem.Reason] {
			visited[elem.Reason] = true
			result = append(result, elem)
		}
	}

	return result
}

// Returns true if given pod is in state ready or succeeded, false otherwise
func isReadyOrSucceeded(pod api.Pod) bool {
	if pod.Status.Phase == api.PodSucceeded {
		return true
	}
	if pod.Status.Phase == api.PodRunning {
		for _, c := range pod.Status.Conditions {
			if c.Type == api.PodReady {
				if c.Status == api.ConditionFalse {
					return false
				}
			}
		}

		return true
	}

	return false
}
