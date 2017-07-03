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
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
)

// GetDeploymentPods returns list of pods targeting deployment.
func GetDeploymentPods(client client.Interface, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, namespace, deploymentName string) (*pod.PodList, error) {

	deployment, err := client.ExtensionsV1beta1().Deployments(namespace).Get(deploymentName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PodList:        common.GetPodListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
		ReplicaSetList: common.GetReplicaSetListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	rawPods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	rawRs := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return nil, err
	}

	pods := common.FilterDeploymentPodsByOwnerReference(*deployment, rawRs.Items, rawPods.Items)
	events, err := event.GetPodsEvents(client, namespace, pods)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods, events, []error{}, dsQuery, metricClient)
	return &podList, nil
}
