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

package daemonset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// GetDaemonSetEvents gets events associated to daemon set.
func GetDaemonSetEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace,
	daemonSetName string) (*common.EventList, error) {

	log.Printf("Getting events related to %s daemon set in %s namespace", daemonSetName,
		namespace)

	// Get events for daemon set.
	dsEvents, err := event.GetEvents(client, namespace, daemonSetName)

	if err != nil {
		return nil, err
	}

	// Get events for pods in daemon set.
	podEvents, err := GetDaemonSetPodsEvents(client, namespace, daemonSetName)

	if err != nil {
		return nil, err
	}

	apiEvents := append(dsEvents, podEvents...)

	if !event.IsTypeFilled(apiEvents) {
		apiEvents = event.FillEventsType(apiEvents)
	}

	events := event.CreateEventList(apiEvents, dsQuery)

	log.Printf("Found %d events related to %s daemon set in %s namespace",
		len(events.Events), daemonSetName, namespace)

	return &events, nil
}

// GetDaemonSetPodsEvents gets events associated to pods in daemon set.
func GetDaemonSetPodsEvents(client client.Interface, namespace, daemonSetName string) (
	[]api.Event, error) {

	daemonSet, err := client.ExtensionsV1beta1().DaemonSets(namespace).Get(daemonSetName, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	podEvents, err := event.GetPodsEvents(client, namespace, daemonSet.Spec.Selector.MatchLabels)

	if err != nil {
		return nil, err
	}

	return podEvents, nil
}
