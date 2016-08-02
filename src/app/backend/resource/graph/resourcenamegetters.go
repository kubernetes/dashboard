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

package graph

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/labels"
	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"fmt"
)


var ResourceNameGetters = map[string]func(k8sClient.Interface, string, string, string)([]string, error){
	"pods": getFullPodNameList,
}



func getFullPodNameList(client k8sClient.Interface, resourceName string, namespace string, resourceValue string) ([]string, error) {
	podList, err := getFullPodList(client, resourceName, namespace, resourceValue)
	if err != nil {
		return nil, err
	}
	return podListToNameList(podList), nil
}

func podListToNameList(podList []api.Pod) ([]string) {
	result := []string{}
	for _, pod := range podList {
		result = append(result, pod.ObjectMeta.Name)
	}
	return result
}

func getFullPodList(client k8sClient.Interface, resourceName string, namespace string, resourceValue string) ([]api.Pod, error) {
	labelGetter, isLabelGetterPresent :=  ResourceLabelGetters[resourceName]
	if !isLabelGetterPresent {
		return nil, fmt.Errorf(`Label getter is not present for resourse "%s"`, resourceName)
	}
	label, err := labelGetter(client, namespace, resourceValue)
	if err != nil {
		return nil, err
	}
	labelSelector := labels.SelectorFromSet(label)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(namespace),
			api.ListOptions{
				LabelSelector: labelSelector,
				FieldSelector: fields.Everything(),
			}, 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	return podList.Items, nil
}

