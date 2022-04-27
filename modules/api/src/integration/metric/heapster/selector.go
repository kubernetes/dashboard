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

package heapster

import (
	"fmt"

	"github.com/emicklei/go-restful/v3/log"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
)

type heapsterSelector struct {
	TargetResourceType api.ResourceKind
	Path               string
	Resources          []string
	metricapi.Label
}

func getHeapsterSelectors(selectors []metricapi.ResourceSelector,
	cachedResources *metricapi.CachedResources) []heapsterSelector {
	result := make([]heapsterSelector, len(selectors))
	for i, selector := range selectors {
		heapsterSelector, err := getHeapsterSelector(selector, cachedResources)
		if err != nil {
			log.Printf("There was an error during transformation to heapster selector: %s", err.Error())
			continue
		}

		result[i] = heapsterSelector
	}

	return result
}

func getHeapsterSelector(selector metricapi.ResourceSelector,
	cachedResources *metricapi.CachedResources) (heapsterSelector, error) {
	summingResource, isDerivedResource := metricapi.DerivedResources[selector.ResourceType]
	if !isDerivedResource {
		return newHeapsterSelectorFromNativeResource(selector.ResourceType, selector.Namespace,
			[]string{selector.ResourceName}, []types.UID{selector.UID})
	}
	// We are dealing with derived resource. Convert derived resource to its native resources.
	// For example, convert deployment to the list of pod names that belong to this deployment
	if summingResource == api.ResourceKindPod {
		myPods, err := getMyPodsFromCache(selector, cachedResources.Pods)
		if err != nil {
			return heapsterSelector{}, err
		}
		return newHeapsterSelectorFromNativeResource(api.ResourceKindPod,
			selector.Namespace, podListToNameList(myPods), podListToUIDList(myPods))
	}
	// currently can only convert derived resource to pods. You can change it by implementing other methods
	return heapsterSelector{}, fmt.Errorf(`Internal Error: Requested summing resources not supported. Requested "%s"`, summingResource)
}

// getMyPodsFromCache returns a full list of pods that belong to this resource.
// It is important that cachedPods include ALL pods from the namespace of this resource (but they
// can also include pods from other namespaces).
func getMyPodsFromCache(selector metricapi.ResourceSelector, cachedPods []v1.Pod) (matchingPods []v1.Pod, err error) {
	switch {
	case cachedPods == nil:
		err = fmt.Errorf(`Pods were not available in cache. Required for resource type: "%s"`,
			selector.ResourceType)
	case selector.ResourceType == api.ResourceKindDeployment:
		for _, pod := range cachedPods {
			if pod.ObjectMeta.Namespace == selector.Namespace && api.IsSelectorMatching(selector.Selector, pod.Labels) {
				matchingPods = append(matchingPods, pod)
			}
		}
	default:
		for _, pod := range cachedPods {
			if pod.Namespace == selector.Namespace {
				for _, ownerRef := range pod.OwnerReferences {
					if ownerRef.Controller != nil && *ownerRef.Controller == true &&
						ownerRef.UID == selector.UID {
						matchingPods = append(matchingPods, pod)
					}
				}
			}
		}
	}
	return
}

// NewHeapsterSelectorFromNativeResource returns new heapster selector for native resources specified in arguments.
// returns error if requested resource is not native or is not supported.
func newHeapsterSelectorFromNativeResource(resourceType api.ResourceKind, namespace string,
	resourceNames []string, resourceUIDs []types.UID) (heapsterSelector, error) {
	// Here we have 2 possibilities because this module allows downloading Nodes and Pods from heapster
	if resourceType == api.ResourceKindPod {
		return heapsterSelector{
			TargetResourceType: api.ResourceKindPod,
			Path:               `namespaces/` + namespace + `/pod-list/`,
			Resources:          resourceNames,
			Label:              metricapi.Label{resourceType: resourceUIDs},
		}, nil
	} else if resourceType == api.ResourceKindNode {
		return heapsterSelector{
			TargetResourceType: api.ResourceKindNode,
			Path:               `nodes/`,
			Resources:          resourceNames,
			Label:              metricapi.Label{resourceType: resourceUIDs},
		}, nil
	} else {
		return heapsterSelector{}, fmt.Errorf(`Resource "%s" is not a native heapster resource type or is not supported`, resourceType)
	}
}

// podListToNameList converts list of pods to the list of pod names.
func podListToNameList(podList []v1.Pod) (result []string) {
	for _, pod := range podList {
		result = append(result, pod.Name)
	}
	return
}

func podListToUIDList(podList []v1.Pod) (result []types.UID) {
	for _, pod := range podList {
		result = append(result, pod.UID)
	}
	return
}
