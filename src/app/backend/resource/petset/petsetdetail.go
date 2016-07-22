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

package petset

import (
	"log"

	"k8s.io/kubernetes/pkg/apis/apps"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
)

// PetSetDetail is a presentation layer view of Kubernetes Pet Set resource. This means
// it is Pet Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type PetSetDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Pet Set.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Pet Set.
	PodList pod.PodList `json:"podList"`

	// Container images of the Pet Set.
	ContainerImages []string `json:"containerImages"`

	// List of events related to this Pet Set.
	EventList common.EventList `json:"eventList"`
}

// GetPetSetDetail gets pet set details.
func GetPetSetDetail(client *k8sClient.Client, heapsterClient client.HeapsterClient,
	namespace, name string, pQuery *common.PaginationQuery) (*PetSetDetail, error) {

	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	// TODO(floreks): Use channels.
	petSetData, err := client.Apps().PetSets(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	podList, err := GetPetSetPods(client, heapsterClient, pQuery, name, namespace)
	if err != nil {
		return nil, err
	}

	podInfo, err := getPetSetPodInfo(client, petSetData)
	if err != nil {
		return nil, err
	}

	events, err := GetPetSetEvents(client, petSetData.Namespace, petSetData.Name)
	if err != nil {
		return nil, err
	}

	petSet := getPetSetDetail(petSetData, heapsterClient, *events, *podList, *podInfo)
	return &petSet, nil
}

func getPetSetDetail(petSet *apps.PetSet, heapsterClient client.HeapsterClient,
	eventList common.EventList, podList pod.PodList, podInfo common.PodInfo) PetSetDetail {

	return PetSetDetail{
		ObjectMeta:      common.NewObjectMeta(petSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindPetSet),
		ContainerImages: common.GetContainerImages(&petSet.Spec.Template.Spec),
		PodInfo:         podInfo,
		PodList:         podList,
		EventList:       eventList,
	}
}
