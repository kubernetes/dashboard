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

package metric
//
//import (
//	"fmt"
//
//	"github.com/kubernetes/dashboard/src/app/backend/api"
//	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
//	"k8s.io/apimachinery/pkg/types"
//	"k8s.io/client-go/pkg/api/v1"
//)
//
//// DerivedResources is a map from a derived resource(a resource that is not supported by heapster)
//// to native resource (supported by heapster) to which derived resource should be converted.
//// For example, deployment is not available in heapster so it has to be converted to its pods before downloading any data.
//// Hence deployments map to pods.
//var DerivedResources = map[api.ResourceKind]api.ResourceKind{
//	api.ResourceKindDeployment:            api.ResourceKindPod,
//	api.ResourceKindReplicaSet:            api.ResourceKindPod,
//	api.ResourceKindReplicationController: api.ResourceKindPod,
//	api.ResourceKindDaemonSet:             api.ResourceKindPod,
//	api.ResourceKindStatefulSet:           api.ResourceKindPod,
//	api.ResourceKindJob:                   api.ResourceKindPod,
//}
//
//// ResourceSelector is a structure used to quickly and uniquely identify given resource.
//// This struct can be later used for heapster data download etc.
//type ResourceSelector struct {
//	// Namespace of this resource.
//	Namespace string
//	// Type of this resource
//	ResourceType api.ResourceKind
//	// Name of this resource.
//	ResourceName string
//	// Selector used to identify this resource (should be used only for Deployments!).
//	Selector map[string]string
//	// UID is resource unique identifier.
//	UID types.UID
//}
//
//// GetHeapsterSelector calculates and returns HeapsterSelector that can be used to download metrics
//// for this resource.
//func (self *ResourceSelector) GetHeapsterSelector(cachedPods []v1.Pod) (HeapsterSelector, error) {
//	summingResource, isDerivedResource := DerivedResources[self.ResourceType]
//	if !isDerivedResource {
//		return NewHeapsterSelectorFromNativeResource(self.ResourceType, self.Namespace, []string{self.ResourceName})
//	}
//	// We are dealing with derived resource. Convert derived resource to its native resources.
//	// For example, convert deployment to the list of pod names that belong to this deployment
//	if summingResource == api.ResourceKindPod {
//		myPods, err := self.getMyPodsFromCache(cachedPods)
//		if err != nil {
//			return HeapsterSelector{}, err
//		}
//		return NewHeapsterSelectorFromNativeResource(api.ResourceKindPod, self.Namespace, podListToNameList(myPods))
//	} else {
//		// currently can only convert derived resource to pods. You can change it by implementing other methods
//		return HeapsterSelector{}, fmt.Errorf(`Internal Error: Requested summing resourceis not supported. Requested "%s"`, summingResource)
//	}
//}
//
//// getMyPodsFromCache returns a full list of pods that belong to this resource.
//// It is important that cachedPods include ALL pods from the namespace of this resource (but they
//// can also include pods from other namespaces).
//func (self *ResourceSelector) getMyPodsFromCache(cachedPods []v1.Pod) ([]v1.Pod, error) {
//	switch {
//	case cachedPods == nil:
//		return nil, fmt.Errorf(`getMyPodsFromCache: pods were not available in cache. Required for resource type: "%s"`, self.ResourceType)
//	case self.ResourceType == api.ResourceKindDeployment:
//		// TODO(maciaszczykm): Use api.FilterDeploymentPodsByOwnerReference() once it will be possible to get list of replica sets here.
//		var matchingPods []v1.Pod
//		for _, pod := range cachedPods {
//			if pod.ObjectMeta.Namespace == self.Namespace && api.IsSelectorMatching(self.Selector, pod.Labels) {
//				matchingPods = append(matchingPods, pod)
//			}
//		}
//		return matchingPods, nil
//	default:
//		return common.FilterPodsByOwnerReference(self.Namespace, self.UID, cachedPods), nil
//	}
//}
//
//// podListToNameList converts list of pods to the list of pod names.
//func podListToNameList(podList []v1.Pod) (result []string) {
//	for _, pod := range podList {
//		result = append(result, pod.ObjectMeta.Name)
//	}
//	return
//}
