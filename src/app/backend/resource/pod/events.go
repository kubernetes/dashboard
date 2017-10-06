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

package pod

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
)

// GetEventsForPod gets events that are associated with this pod.
func GetEventsForPod(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace,
	podName string) (*common.EventList, error) {
	eventList := common.EventList{
		Events:   make([]common.Event, 0),
		ListMeta: api.ListMeta{TotalItems: 0},
	}

	podEvents, err := event.GetPodEvents(client, namespace, podName)
	if err != nil {
		return &eventList, err
	}

	eventList = event.CreateEventList(podEvents, dsQuery)

	log.Printf("Found %d events related to %s pod in %s namespace", len(eventList.Events), podName,
		namespace)

	return &eventList, nil
}
