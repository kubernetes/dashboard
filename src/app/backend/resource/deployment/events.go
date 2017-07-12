// Copyright 2017 The Kubernetes Dashboard Authors.
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

package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
)

// GetDeploymentEvents returns model events for a deployment with the given name in the given namespace.
func GetDeploymentEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace string,
	deploymentName string) (*common.EventList, error) {

	dpEvents, err := event.GetEvents(client, namespace, deploymentName)
	if err != nil {
		return nil, err
	}

	eventList := event.CreateEventList(dpEvents, dsQuery)
	return &eventList, nil
}
