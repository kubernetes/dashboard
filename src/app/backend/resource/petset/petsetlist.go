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

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"

	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/apis/apps"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// PetSetList contains a list of Pet Sets in the cluster.
type PetSetList struct {
	// Unordered list of Pet Sets.
	PetSets []PetSet `json:"petSets"`
}

// PetSet is a presentation layer view of Kubernetes Pet Set resource. This means
// it is Pet Set plus additional augumented data we can get from other sources
// (like services that target the same pods).
type PetSet struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Pet Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Pet Set.
	ContainerImages []string `json:"containerImages"`
}

// GetPetSetList returns a list of all Pet Sets in the cluster.
func GetPetSetList(client *client.Client, nsQuery *common.NamespaceQuery) (*PetSetList, error) {
	log.Printf("Getting list of all pet sets in the cluster")

	channels := &common.ResourceChannels{
		PetSetList: common.GetPetSetListChannel(client.Apps(), nsQuery, 1),
		PodList:    common.GetPodListChannel(client, nsQuery, 1),
		EventList:  common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetPetSetListFromChannels(channels)
}

// GetPetSetList returns a list of all Pet Sets in the cluster
// reading required resource list once from the channels.
func GetPetSetListFromChannels(channels *common.ResourceChannels) (
	*PetSetList, error) {

	petSets := <-channels.PetSetList.List
	if err := <-channels.PetSetList.Error; err != nil {
		statusErr, ok := err.(*k8serrors.StatusError)
		if ok && statusErr.ErrStatus.Reason == "NotFound" {
			// NotFound - this means that the server does not support Pet Set objects, which
			// is fine.
			emptyList := &PetSetList{
				PetSets: make([]PetSet, 0),
			}
			return emptyList, nil
		}
		return nil, err
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	events := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	return ToPetSetList(petSets.Items, pods.Items, events.Items), nil
}

func ToPetSetList(petSets []apps.PetSet, pods []api.Pod, events []api.Event) *PetSetList {

	petSetList := &PetSetList{
		PetSets: make([]PetSet, 0),
	}

	for _, petSet := range petSets {
		matchingPods := common.FilterNamespacedPodsBySelector(pods, petSet.ObjectMeta.Namespace,
			petSet.Spec.Selector.MatchLabels)
		// TODO(floreks): Conversion should be omitted when client type will be updated
		podInfo := common.GetPodInfo(int32(petSet.Status.Replicas), int32(petSet.Spec.Replicas),
			matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		petSetList.PetSets = append(petSetList.PetSets, ToPetSet(&petSet, &podInfo))
	}

	return petSetList
}

func ToPetSet(petSet *apps.PetSet, podInfo *common.PodInfo) PetSet {
	return PetSet{
		ObjectMeta:      common.NewObjectMeta(petSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindPetSet),
		ContainerImages: common.GetContainerImages(&petSet.Spec.Template.Spec),
		Pods:            *podInfo,
	}
}
