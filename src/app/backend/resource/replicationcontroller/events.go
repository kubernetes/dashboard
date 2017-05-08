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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	resourceEvent "github.com/kubernetes/dashboard/src/app/backend/resource/event"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// GetReplicationControllerEvents returns events for particular namespace and replication
// controller or error if occurred.
func GetReplicationControllerEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery,
	namespace, replicationControllerName string) (*common.EventList, error) {

	log.Printf("Getting events related to %s replication controller in %s namespace", replicationControllerName,
		namespace)

	// Get events for replication controller.
	rsEvents, err := resourceEvent.GetEvents(client, namespace, replicationControllerName)

	if err != nil {
		return nil, err
	}

	// Get events for pods in replication controller.
	podEvents, err := getReplicationControllerPodsEvents(client, namespace,
		replicationControllerName)

	if err != nil {
		return nil, err
	}

	apiEvents := append(rsEvents, podEvents...)

	if !resourceEvent.IsTypeFilled(apiEvents) {
		apiEvents = resourceEvent.FillEventsType(apiEvents)
	}

	events := resourceEvent.CreateEventList(apiEvents, dsQuery)

	log.Printf("Found %d events related to %s replication controller in %s namespace",
		len(events.Events), replicationControllerName, namespace)

	return &events, nil
}

func getReplicationControllerPodsEvents(client client.Interface, namespace,
	replicationControllerName string) ([]api.Event, error) {

	replicationController, err := client.CoreV1().ReplicationControllers(namespace).Get(replicationControllerName, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	podEvents, err := resourceEvent.GetPodsEvents(client, namespace,
		replicationController.Spec.Selector)

	if err != nil {
		return nil, err
	}

	return podEvents, nil
}
