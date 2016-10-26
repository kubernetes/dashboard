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

package petsetdetail

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// GetPetSetEvents gets events associated to pet set.
func GetPetSetEvents(client *client.Client, dsQuery *dataselect.DataSelectQuery, namespace, petSetName string) (
	*common.EventList, error) {

	log.Printf("Getting events related to %s pet set in %s namespace", petSetName,
		namespace)

	// Get events for pet set.
	rsEvents, err := event.GetEvents(client, namespace, petSetName)

	if err != nil {
		return nil, err
	}

	// Get events for pods in pet set.
	podEvents, err := GetPetSetPodsEvents(client, namespace, petSetName)

	if err != nil {
		return nil, err
	}

	apiEvents := append(rsEvents, podEvents...)

	if !event.IsTypeFilled(apiEvents) {
		apiEvents = event.FillEventsType(apiEvents)
	}

	events := event.CreateEventList(apiEvents, dsQuery)

	log.Printf("Found %d events related to %s pet set in %s namespace",
		len(events.Events), petSetName, namespace)

	return &events, nil
}

// GetPetSetPodsEvents gets events associated to pods in pet set.
func GetPetSetPodsEvents(client *client.Client, namespace, petSetName string) (
	[]api.Event, error) {

	petSet, err := client.Apps().PetSets(namespace).Get(petSetName)

	if err != nil {
		return nil, err
	}

	podEvents, err := event.GetPodsEvents(client, namespace, petSet.Spec.Selector.MatchLabels)

	if err != nil {
		return nil, err
	}

	return podEvents, nil
}
