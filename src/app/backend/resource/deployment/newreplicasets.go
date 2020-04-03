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

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
)

// GetDeploymentNewReplicaSet returns old replica sets targeting Deployment with given name
func GetDeploymentNewReplicaSet(client client.Interface, dsQuery *dataselect.DataSelectQuery,
	namespace string, deploymentName string) (*replicaset.ReplicaSet, error) {

	newReplicaSet := &replicaset.ReplicaSet{}

	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), deploymentName, metaV1.GetOptions{})
	if err != nil {
		return newReplicaSet, err
	}

	selector, err := metaV1.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		return newReplicaSet, err
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
		return newReplicaSet, err
	}

	rawPods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return newReplicaSet, err
	}

	rawEvents := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return newReplicaSet, criticalError
	}

	rawRepSets := make([]*apps.ReplicaSet, 0)
	for i := range rawRs.Items {
		rawRepSets = append(rawRepSets, &rawRs.Items[i])
	}
	newRS := FindNewReplicaSet(deployment, rawRepSets)
	if newRS == nil {
		return newReplicaSet, err
	}

	newReplicaSetList := replicaset.ToReplicaSetList([]apps.ReplicaSet{*newRS}, rawPods.Items, rawEvents.Items,
		nonCriticalErrors, dsQuery, nil)
	return &newReplicaSetList.ReplicaSets[0], nil
}
