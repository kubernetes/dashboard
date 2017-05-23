package heapster

import (
	"fmt"
	"github.com/emicklei/go-restful/log"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
)

type heapsterSelector struct {
	TargetResourceType api.ResourceKind
	Path               string
	Resources          []string
	metricapi.Label
}

func getHeapsterSelectors(selectors []metricapi.ResourceSelector) []heapsterSelector {
	result := make([]heapsterSelector, len(selectors))
	for i, selector := range selectors {
		heapsterSelector, err := getHeapsterSelector(selector)
		if err != nil {
			log.Printf("There was an error during transformation to heapster selector: %s", err.Error())
			continue
		}

		result[i] = heapsterSelector
	}

	return result
}

func getHeapsterSelector(selector metricapi.ResourceSelector) (heapsterSelector, error) {
	summingResource, isDerivedResource := metricapi.DerivedResources[selector.ResourceType]
	if !isDerivedResource {
		return newHeapsterSelectorFromNativeResource(selector.ResourceType, selector.Namespace, []string{selector.ResourceName})
	}
	// We are dealing with derived resource. Convert derived resource to its native resources.
	// For example, convert deployment to the list of pod names that belong to this deployment
	if summingResource == api.ResourceKindPod {
		//myPods, err := self.getMyPodsFromCache(cachedPods)
		//if err != nil {
		//	return heapsterSelector{}, err
		//}
		return newHeapsterSelectorFromNativeResource(api.ResourceKindPod, selector.Namespace, []string{}) // podListToNameList(myPods)
	} else {
		// currently can only convert derived resource to pods. You can change it by implementing other methods
		return heapsterSelector{}, fmt.Errorf(`Internal Error: Requested summing resources not supported. Requested "%s"`, summingResource)
	}
}

// NewHeapsterSelectorFromNativeResource returns new heapster selector for native resources specified in arguments.
// returns error if requested resource is not native or is not supported.
func newHeapsterSelectorFromNativeResource(resourceType api.ResourceKind, namespace string, resourceNames []string) (heapsterSelector, error) {
	// Here we have 2 possibilities because this module allows downloading Nodes and Pods from heapster
	if resourceType == api.ResourceKindPod {
		return heapsterSelector{
			TargetResourceType: api.ResourceKindPod,
			Path:               `namespaces/` + namespace + `/pod-list/`,
			Resources:          resourceNames,
			Label:              metricapi.Label{resourceType: resourceNames},
		}, nil
	} else if resourceType == api.ResourceKindNode {
		return heapsterSelector{
			TargetResourceType: api.ResourceKindNode,
			Path:               `nodes/`,
			Resources:          resourceNames,
			Label:              metricapi.Label{resourceType: resourceNames},
		}, nil
	} else {
		return heapsterSelector{}, fmt.Errorf(`Resource "%s" is not a native heapster resource type or is not supported`, resourceType)
	}
}
