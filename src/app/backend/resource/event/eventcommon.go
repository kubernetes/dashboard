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

package event

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
	"k8s.io/kubernetes/pkg/types"
)

// GetEvents gets events associated to resource with given name.
func GetEvents(client client.EventNamespacer, namespace, resourceName string) ([]api.Event, error) {

	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + resourceName)

	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		EventList: common.GetEventListChannelWithOptions(
			client,
			common.NewSameNamespaceQuery(namespace),
			api.ListOptions{
				LabelSelector: labels.Everything(),
				FieldSelector: fieldSelector,
			},
			1),
	}

	eventList := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	return eventList.Items, nil
}

// GetPodsEvents gets pods events associated to resource targeted by given resource selector.
func GetPodsEvents(client client.Interface, namespace string, resourceSelector map[string]string) (
	[]api.Event, error) {

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(
			client,
			common.NewSameNamespaceQuery(namespace),
			api.ListOptions{
				LabelSelector: labels.SelectorFromSet(resourceSelector),
				FieldSelector: fields.Everything(),
			},
			1),
		EventList: common.GetEventListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	eventList := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	events := filterEventsByPodsUID(eventList.Items, podList.Items)

	return events, nil
}

// GetNodeEvents gets events associated to node with given name.
func GetNodeEvents(client client.Interface, nodeName string) (common.EventList, error) {
	var eventList common.EventList

	mc := client.Nodes()
	node, _ := mc.Get(nodeName)
	if ref, err := api.GetReference(node); err == nil {
		ref.UID = types.UID(ref.Name)
		events, _ := client.Events(api.NamespaceAll).Search(ref)
		// TODO add pagination support
		eventList = CreateEventList(events.Items, common.NO_PAGINATION)
	} else {
		log.Print(err)
	}

	return eventList, nil
}

// Based on event Reason fills event Type in order to allow correct filtering by Type.
func FillEventsType(events []api.Event) []api.Event {
	for i := range events {
		if isFailedReason(events[i].Reason, FailedReasonPartials...) {
			events[i].Type = api.EventTypeWarning
		} else {
			events[i].Type = api.EventTypeNormal
		}
	}

	return events
}

// IsTypeFilled returns true if all given events type is filled, false otherwise.
// This is needed as some older versions of kubernetes do not have Type property filled.
func IsTypeFilled(events []api.Event) bool {
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

// ToEvent converts event api Event to Event model object.
func ToEvent(event api.Event) common.Event {
	result := common.Event{
		ObjectMeta:      common.NewObjectMeta(event.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindEvent),
		Message:         event.Message,
		SourceComponent: event.Source.Component,
		SourceHost:      event.Source.Host,
		SubObject:       event.InvolvedObject.FieldPath,
		Count:           event.Count,
		FirstSeen:       event.FirstTimestamp,
		LastSeen:        event.LastTimestamp,
		Reason:          event.Reason,
		Type:            event.Type,
	}

	return result
}

// CreateEventList converts array of api events to common EventList structure
func CreateEventList(events []api.Event, pQuery *common.PaginationQuery) common.EventList {

	eventList := common.EventList{
		Events: make([]common.Event, 0),
		ListMeta: common.ListMeta{TotalItems: len(events)},
	}

	events = paginate(events, pQuery)

	for _, event := range events {
		eventDetail := ToEvent(event)
		eventList.Events = append(eventList.Events, eventDetail)
	}

	return eventList
}

func paginate(events []api.Event, pQuery *common.PaginationQuery) []api.Event {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(events))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(events), startIndex) {
		return events
	}

	return events[startIndex:endIndex]
}
