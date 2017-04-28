package metric

import (
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/apimachinery/pkg/types"
	api "k8s.io/client-go/pkg/api/v1"
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
	// Selector used to identify this resource (should be used only for Deployments!).
	Selector map[string]string
	// UID is resource unique identifier.
	UID types.UID
}

// GetHeapsterSelector calculates and returns HeapsterSelector that can be used to download metrics
// for this resource.
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
		return HeapsterSelector{}, fmt.Errorf(`Internal Error: Requested summing resourceis not supported. Requested "%s"`, summingResource)
	}
}

// getMyPodsFromCache returns a full list of pods that belong to this resource.
// It is important that cachedPods include ALL pods from the namespace of this resource (but they
// can also include pods from other namespaces).
func (self *ResourceSelector) getMyPodsFromCache(cachedPods []api.Pod) ([]api.Pod, error) {
	switch {
	case cachedPods == nil:
		return nil, fmt.Errorf(`getMyPodsFromCache: pods were not available in cache. Required for resource type: "%s"`, self.ResourceType)
	case self.ResourceType == common.ResourceKindDeployment:
		// TODO(maciaszczykm): Use common.FilterDeploymentPodsByOwnerReference() once it will be possible to get list of replica sets here.
		var matchingPods []api.Pod
		for _, pod := range cachedPods {
			if pod.ObjectMeta.Namespace == self.Namespace && common.IsSelectorMatching(self.Selector, pod.Labels) {
				matchingPods = append(matchingPods, pod)
			}
		}
		return matchingPods, nil
	default:
		return common.FilterPodsByOwnerReference(self.Namespace, self.UID, cachedPods), nil
	}
}

// podListToNameList converts list of pods to the list of pod names.
func podListToNameList(podList []api.Pod) (result []string) {
	for _, pod := range podList {
		result = append(result, pod.ObjectMeta.Name)
	}
	return
}
