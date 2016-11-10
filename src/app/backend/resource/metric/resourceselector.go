package metric

import (
	"fmt"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
)

// DerivedResources is a map from a derived resource(a resource that is not supported by heapster)
// to native resource (supported by heapster) to which derived resource should be converted.
// For example, deployment is not available in heapster so it has to be converted to its pods before downloading any data.
// Hence deployments map to pods.
var DerivedResources = map[common.ResourceKind]common.ResourceKind{
	common.ResourceKindDeployment:            common.ResourceKindPod,
	common.ResourceKindReplicaSet:            common.ResourceKindPod,
	common.ResourceKindReplicationController: common.ResourceKindPod,
	common.ResourceKindDaemonSet:             common.ResourceKindPod,
	common.ResourceKindStatefulSet:           common.ResourceKindPod,
	common.ResourceKindJob:                   common.ResourceKindPod,
}

// ResourceSelector is a structure used to quickly and uniquely identify given resource.
// This struct can be later used for heapster data download etc.
type ResourceSelector struct {
	// Namespace of this resource.
	Namespace string
	// Type of this resource
	ResourceType common.ResourceKind
	// Name of this resource.
	ResourceName string
	// Selector used to identify this resource (if any).
	Selector map[string]string
	// Newer version of selector used to identify this resource (if any).
	LabelSelector *unversioned.LabelSelector
}

// GetHeapsterSelector calculates and returns HeapsterSelector that can be used to download metrics for this resource.
func (self *ResourceSelector) GetHeapsterSelector(cachedPods []api.Pod) (HeapsterSelector, error) {
	summingResource, isDerivedResource := DerivedResources[self.ResourceType]
	if !isDerivedResource {
		return NewHeapsterSelectorFromNativeResource(self.ResourceType, self.Namespace, []string{self.ResourceName})
	}
	// We are dealing with derived resource. Convert derived resource to its native resources.
	// For example, convert deployment to the list of pod names that belong to this deployment
	if summingResource == common.ResourceKindPod {
		myPods, err := self.getMyPodsFromCache(cachedPods)
		if err != nil {
			return HeapsterSelector{}, err
		}
		return NewHeapsterSelectorFromNativeResource(common.ResourceKindPod, self.Namespace, podListToNameList(myPods))
	} else {
		// currently can only convert derived resource to pods. You can change it by implementing other methods
		return HeapsterSelector{}, fmt.Errorf(`Internal Error: Requested summing resource is not supported. Requested "%s"`, summingResource)
	}
}

// getMyPodsFromCache returns a full list of pods that belong to this resource.
// It is important that cachedPods include ALL pods from the namespace of this resource (but they can also include pods from other namespaces).
func (self *ResourceSelector) getMyPodsFromCache(cachedPods []api.Pod) ([]api.Pod, error) {
	// make sure we have the full list of pods. you have to make sure the cache has pod list for all namespaces!
	if cachedPods == nil {
		return nil, fmt.Errorf(`GetMyPodsFromCache: pods were not available in cache. Required for resource type: "%s"`, self.ResourceType)
	}

	// now decide whether to match by ResourceSelector or by ResourceLabelSelector
	if self.LabelSelector != nil {
		return common.FilterNamespacedPodsByLabelSelector(cachedPods, self.Namespace, self.LabelSelector), nil

	} else if self.Selector != nil {
		return common.FilterNamespacedPodsBySelector(cachedPods, self.Namespace, self.Selector), nil
	} else {
		return nil, fmt.Errorf(`GetMyPodsFromCache: did not find any resource selector for resource type: "%s"`, self.ResourceType)
	}
}

// Converts list of pods to the list of pod names.
func podListToNameList(podList []api.Pod) []string {
	result := []string{}
	for _, pod := range podList {
		result = append(result, pod.ObjectMeta.Name)
	}
	return result
}
