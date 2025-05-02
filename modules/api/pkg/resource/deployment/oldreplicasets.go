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

package deployment

import (
	"context"

	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/replicaset"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// GetDeploymentOldReplicaSets returns old replica sets targeting Deployment with given name
func GetDeploymentOldReplicaSets(client client.Interface, dsQuery *dataselect.DataSelectQuery,
	namespace string, deploymentName string) (*replicaset.ReplicaSetList, error) {

	oldReplicaSetList := &replicaset.ReplicaSetList{
		ReplicaSets: make([]replicaset.ReplicaSet, 0),
		ListMeta:    types.ListMeta{TotalItems: 0},
	}

	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), deploymentName, metaV1.GetOptions{})
	if err != nil {
		return oldReplicaSetList, err
	}

	selector, err := metaV1.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		return oldReplicaSetList, err
	}
	options := metaV1.ListOptions{LabelSelector: selector.String()}

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
		PodList: common.GetPodListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
		EventList: common.GetEventListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
	}

	rawRs := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return oldReplicaSetList, err
	}

	rawPods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return oldReplicaSetList, err
	}

	rawEvents := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return oldReplicaSetList, criticalError
	}

	rawRepSets := make([]*apps.ReplicaSet, 0)
	for i := range rawRs.Items {
		rawRepSets = append(rawRepSets, &rawRs.Items[i])
	}
	oldRs, _, err := FindOldReplicaSets(deployment, rawRepSets)
	if err != nil {
		return oldReplicaSetList, err
	}

	oldReplicaSets := make([]apps.ReplicaSet, len(oldRs))
	for i, replicaSet := range oldRs {
		oldReplicaSets[i] = *replicaSet
	}

	oldReplicaSetList = replicaset.ToReplicaSetList(oldReplicaSets, rawPods.Items, rawEvents.Items,
		nonCriticalErrors, dsQuery, nil)
	return oldReplicaSetList, nil
}
