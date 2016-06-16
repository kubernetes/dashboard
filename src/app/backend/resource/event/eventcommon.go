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
	"github.com/kubernetes/dashboard/resource/common"

	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
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

	events := FilterEventsByPodsUID(eventList.Items, podList.Items)

	return events, nil
}

// GetNodeEvents gets events associated to node with given name.
func GetNodeEvents(client client.EventNamespacer, node api.Node) ([]api.Event, error) {
	fieldSelector, err := fields.ParseSelector("involvedObject.name=" + node.ObjectMeta.Name)

	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		EventList: common.GetEventListChannelWithOptions(
			client,
			&common.NamespaceQuery{},
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

// AppendEvents appends events from source slice to target events representation.
func AppendEvents(source []api.Event, target common.EventList) common.EventList {
	for _, event := range source {
		target.Events = append(target.Events, common.Event{
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
		})
	}
	return target
}
