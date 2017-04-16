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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// GetEvents gets events associated to resource with given name.
func GetEvents(client client.Interface, namespace, resourceName string) ([]api.Event, error) {

	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + resourceName)

	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		EventList: common.GetEventListChannelWithOptions(
			client,
			common.NewSameNamespaceQuery(namespace),
			metaV1.ListOptions{
				LabelSelector: labels.Everything().String(),
				FieldSelector: fieldSelector.String(),
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
			metaV1.ListOptions{
				LabelSelector: labels.SelectorFromSet(resourceSelector).String(),
				FieldSelector: fields.Everything().String(),
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

// GetPodEvents gets pods events associated to pod name and namespace
func GetPodEvents(client client.Interface, namespace, podName string) ([]api.Event, error) {

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannel(client,
			common.NewSameNamespaceQuery(namespace),
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

	l := podList.Items[:0]
	for _, pi := range podList.Items {
		if pi.Name == podName {
			l = append(l, pi)
		}
	}

	events := filterEventsByPodsUID(eventList.Items, l)

	return events, nil
}

// GetNodeEvents gets events associated to node with given name.
func GetNodeEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery, nodeName string) (*common.EventList, error) {
	eventList := common.EventList{
		Events: make([]common.Event, 0),
	}

	scheme := runtime.NewScheme()
	groupVersion := schema.GroupVersion{Group: "", Version: "v1"}
	scheme.AddKnownTypes(groupVersion, &api.Node{})

	mc := client.CoreV1().Nodes()
	node, err := mc.Get(nodeName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	events, err := client.CoreV1().Events(api.NamespaceAll).Search(scheme, node)
	if err != nil {
		return nil, err
	}

	eventList = CreateEventList(events.Items, dsQuery)
	return &eventList, nil
}

// GetNodeEvents gets events associated to node with given name.
func GetNamespaceEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace string) (common.EventList, error) {
	events, _ := client.Core().Events(namespace).List(metaV1.ListOptions{
		LabelSelector: labels.Everything().String(),
		FieldSelector: fields.Everything().String(),
	})
	return CreateEventList(events.Items, dsQuery), nil
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
func CreateEventList(events []api.Event, dsQuery *dataselect.DataSelectQuery) common.EventList {

	eventList := common.EventList{
		Events:   make([]common.Event, 0),
		ListMeta: common.ListMeta{TotalItems: len(events)},
	}

	events = fromCells(dataselect.GenericDataSelect(toCells(events), dsQuery))

	for _, event := range events {
		eventDetail := ToEvent(event)
		eventList.Events = append(eventList.Events, eventDetail)
	}

	return eventList
}

// The code below allows to perform complex data section on []api.Event

type EventCell api.Event

func (self EventCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []api.Event) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = EventCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []api.Event {
	std := make([]api.Event, len(cells))
	for i := range std {
		std[i] = api.Event(cells[i].(EventCell))
	}
	return std
}
