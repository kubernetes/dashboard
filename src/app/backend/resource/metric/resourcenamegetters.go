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

package metric

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/labels"
	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"fmt"
)


// ResourceNameGetters is a map holding name getters for different resource types
// For example getFullXYZNameList - returns full list of names of XYZ resources belonging to another resource.
var ResourceNameGetters = map[string]func(k8sClient.Interface, string, string, string)([]string, error){
	"pods": getFullPodNameList,
}

// Gets full list of pod names for given resourceType (eg "deployments") and resourceName under some namespace( eg name of deployment)
// Supported resourceTypes are those defined in ResourceLabelGetters.
func getFullPodNameList(client k8sClient.Interface, resourceName string, namespace string, resourceValue string) ([]string, error) {
	podList, err := getFullPodList(client, resourceName, namespace, resourceValue)
	if err != nil {
		return nil, err
	}
	return podListToNameList(podList), nil
}

// Converts list of pods to the list of pod names.
func podListToNameList(podList []api.Pod) ([]string) {
	result := []string{}
	for _, pod := range podList {
		result = append(result, pod.ObjectMeta.Name)
	}
	return result
}

// Gets full list of pods for given resourceType (eg "deployments") and resourceName under some namespace( eg name of deployment)
// Supported resourceTypes are those defined in ResourceLabelGetters.
func getFullPodList(client k8sClient.Interface, resourceType string, namespace string, resourceName string) ([]api.Pod, error) {
	// choose the appropriate labelGetter for this resourceType
	labelGetter, isLabelGetterPresent :=  ResourceLabelGetters[resourceType]
	if !isLabelGetterPresent {
		return nil, fmt.Errorf(`Label getter is not present for resourse "%s"`, resourceType)
	}
	// Use the labelGetter to get label of this resource
	label, err := labelGetter(client, namespace, resourceName)
	if err != nil {
		return nil, err
	}
	// Use the label to select all pods belonging to this resource.
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
