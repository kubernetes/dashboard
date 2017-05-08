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

package statefulset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// GetStatefulSetEvents gets events associated to pet set.
func GetStatefulSetEvents(client *client.Clientset, dsQuery *dataselect.DataSelectQuery, namespace, statefulSetName string) (
	*common.EventList, error) {

	log.Printf("Getting events related to %s pet set in %s namespace", statefulSetName,
		namespace)

	// Get events for pet set.
	rsEvents, err := event.GetEvents(client, namespace, statefulSetName)

	if err != nil {
		return nil, err
	}

	// Get events for pods in pet set.
	podEvents, err := GetStatefulSetPodsEvents(client, namespace, statefulSetName)

	if err != nil {
		return nil, err
	}

	apiEvents := append(rsEvents, podEvents...)

	if !event.IsTypeFilled(apiEvents) {
		apiEvents = event.FillEventsType(apiEvents)
	}

	events := event.CreateEventList(apiEvents, dsQuery)

	log.Printf("Found %d events related to %s pet set in %s namespace",
		len(events.Events), statefulSetName, namespace)

	return &events, nil
}

// GetStatefulSetPodsEvents gets events associated to pods in pet set.
func GetStatefulSetPodsEvents(client *client.Clientset, namespace, statefulSetName string) (
	[]api.Event, error) {

	statefulSet, err := client.AppsV1beta1().StatefulSets(namespace).Get(statefulSetName, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	podEvents, err := event.GetPodsEvents(client, namespace, statefulSet.Spec.Selector.MatchLabels)

	if err != nil {
		return nil, err
	}

	return podEvents, nil
}
