package metric

import (
	"k8s.io/kubernetes/pkg/api"
	"fmt"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api/unversioned"
)

type MetricResourceType string
type CachedPods map[string][]api.Pod
// List of all resource Types that support metric download
const (
	ResourceTypeReplicaSet            = "replicasets"
	ResourceTypeService               = "services"
	ResourceTypeDeployment            = "deployments"
	ResourceTypePod                   = "pods"
	ResourceTypeEvent                 = "events"
	ResourceTypeReplicationController = "replicationcontrollers"
	ResourceTypeDaemonSet             = "daemonsets"
	ResourceTypeJob                   = "jobs"
	ResourceTypePetSet                = "petsets"
	ResourceTypeNamespace             = "namespaces"
	ResourceTypeNode                  = "nodes"
	ResourceTypeConfigMap             = "configmaps"
	ResourceTypePersistentVolume      = "persistentvolumes"
)




// ResourceSelector is a structure used to quickly and uniquely identify given resource.
// This struct can be later used for heapster data download etc.
type ResourceSelector struct {
	Namespace     string
	ResourceType  MetricResourceType
	ResourceName  string
	Selector      map[string]string
	LabelSelector *unversioned.LabelSelector
}



func (self *ResourceSelector) GetHeapsterSelector(cachedPods CachedPods) (HeapsterSelector, error) {
	summingResource, isDerivedResource := DerivedResources[string(self.ResourceType)]
	if !isDerivedResource {
		return HeapsterSelectorFromNativeResource(self.ResourceType, self.Namespace, []string{self.ResourceName})
	}

	// therefore we are dealing with derived resource

	if summingResource == ResourceTypePod {
		myPods, err := self.GetMyPodsFromCache(cachedPods)
		if err != nil {
			return HeapsterSelector{}, err
		}
		return HeapsterSelectorFromNativeResource(ResourceTypePod, self.Namespace, podListToNameList(myPods))
	} else {
		// currently can only convert derived resource to pods. You can change it by implementing other methods
		return HeapsterSelector{}, fmt.Errorf(`Internal Error: Can only convert derived resources to pods. Requested "%s"`, summingResource)
	}
}

func (self *ResourceSelector) GetMyPodsFromCache(cachedPods CachedPods) ([]api.Pod, error) {
	// make sure we have the full list of pods. you have to make sure the cache has pod list for all namespaces!
	if cachedPods == nil {
		return nil, fmt.Errorf("GetMyPodsFromCache: namespace of the pod not in cachedPods")
	}
	pods, arePodsPresent := cachedPods[self.Namespace]
	if !arePodsPresent {
		return nil, fmt.Errorf("GetMyPodsFromCache: namespace of the pod not in cachedPods")
	}

	// now decide whether to match by ResourceSelector or by ResourceLabelSelector
	if self.LabelSelector != nil {
		return common.FilterPodsByLabelSelector(pods, self.LabelSelector), nil

	} else if self.Selector != nil {
		return common.FilterPodsBySelector(pods, self.Selector), nil
	} else {
		return nil, fmt.Errorf(`GetMyPodsFromCache: did not find any resource selector for resource type: "%s"`, self.ResourceType)
	}
}
