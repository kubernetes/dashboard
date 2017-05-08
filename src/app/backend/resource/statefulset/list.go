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

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
)

// StatefulSetList contains a list of Stateful Sets in the cluster.
type StatefulSetList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Pet Sets.
	StatefulSets      []StatefulSet   `json:"statefulSets"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
}

// StatefulSet is a presentation layer view of Kubernetes Stateful Set resource. This means it is
// Stateful Set plus additional augmented data we can get from other sources (like services that
// target the same pods).
type StatefulSet struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Pet Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Stateful Set.
	ContainerImages []string `json:"containerImages"`
}

// GetStatefulSetList returns a list of all Stateful Sets in the cluster.
func GetStatefulSetList(client *client.Clientset, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*StatefulSetList, error) {
	log.Print("Getting list of all pet sets in the cluster")

	channels := &common.ResourceChannels{
		StatefulSetList: common.GetStatefulSetListChannel(client, nsQuery, 1),
		PodList:         common.GetPodListChannel(client, nsQuery, 1),
		EventList:       common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetStatefulSetListFromChannels(channels, dsQuery, heapsterClient)
}

// GetStatefulSetListFromChannels returns a list of all Stateful Sets in the cluster reading
// required resource list once from the channels.
func GetStatefulSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*StatefulSetList, error) {

	statefulSets := <-channels.StatefulSetList.List
	if err := <-channels.StatefulSetList.Error; err != nil {
		statusErr, ok := err.(*k8serrors.StatusError)
		if ok && statusErr.ErrStatus.Reason == "NotFound" {
			// NotFound - this means that the server does not support Pet Set objects, which
			// is fine.
			emptyList := &StatefulSetList{
				StatefulSets: make([]StatefulSet, 0),
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

	return CreateStatefulSetList(statefulSets.Items, pods.Items, events.Items, dsQuery, heapsterClient), nil
}

// CreateStatefulSetList creates paginated list of Stateful Set model objects based on Kubernetes
// Stateful Set objects array and related resources arrays.
func CreateStatefulSetList(statefulSets []apps.StatefulSet, pods []api.Pod, events []api.Event,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *StatefulSetList {

	statefulSetList := &StatefulSetList{
		StatefulSets: make([]StatefulSet, 0),
		ListMeta:     common.ListMeta{TotalItems: len(statefulSets)},
	}

	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	ssCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(
		toCells(statefulSets), dsQuery, cachedResources, heapsterClient)
	statefulSets = fromCells(ssCells)
	statefulSetList.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, statefulSet := range statefulSets {
		matchingPods := common.FilterPodsByOwnerReference(statefulSet.Namespace,
			statefulSet.UID, pods)
		// TODO(floreks): Conversion should be omitted when client type will be updated
		podInfo := common.GetPodInfo(statefulSet.Status.Replicas,
			*statefulSet.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)
		statefulSetList.StatefulSets = append(statefulSetList.StatefulSets,
			ToStatefulSet(&statefulSet, &podInfo))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	statefulSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		statefulSetList.CumulativeMetrics = make([]metric.Metric, 0)
	}

	return statefulSetList
}

// ToStatefulSet transforms pet set into StatefulSet object returned by API.
func ToStatefulSet(statefulSet *apps.StatefulSet, podInfo *common.PodInfo) StatefulSet {
	return StatefulSet{
		ObjectMeta:      common.NewObjectMeta(statefulSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindStatefulSet),
		ContainerImages: common.GetContainerImages(&statefulSet.Spec.Template.Spec),
		Pods:            *podInfo,
	}
}
