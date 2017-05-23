package heapster

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	heapster "k8s.io/heapster/metrics/api/v1/types"
)

// removeDuplicates returns a new list of strings with duplicates removed.
func removeDuplicates(list []string) []string {
	// uniqueEntries will store unique elements of the list. Maps cannot have duplicate keys.
	uniqueEntries := map[string]bool{}
	for _, e := range list {
		uniqueEntries[e] = false
	}
	uniqueList := []string{}
	for e := range uniqueEntries {
		uniqueList = append(uniqueList, e)
	}
	return uniqueList

}

// compress compresses list of HeapsterSelectors to equivalent, shorter one in order to perform smaller number of requests.
// For example if we have 2 HeapsterSelectors, first downloading data for pods A, B and second one downloading data for pods B,C.
// compress will compress this to just one HeapsterSelector downloading data for A,B,C. Reverse mapping returned provides
// a mapping between indices from new compressed list to the list of children indices from original list.
func compress(selectors []heapsterSelector) ([]heapsterSelector, map[string][]int) {
	reverseMapping := map[string][]int{}
	resourceTypeMap := map[string]api.ResourceKind{}
	resourceMap := map[string][]string{}
	labelMap := map[string]metricapi.Label{}
	for i, selector := range selectors {
		entry := selector.Path
		resources, doesEntryExist := resourceMap[selector.Path]
		// compress resources
		resourceMap[entry] = append(resources, selector.Resources...)
		// compress labels
		if !doesEntryExist {
			resourceTypeMap[entry] = selector.TargetResourceType // this will be the same for all entries
			labelMap[entry] = metricapi.Label{}
		}
		labelMap[entry].AddMetricLabel(selector.Label)
		reverseMapping[entry] = append(reverseMapping[entry], i)
	}
	// create new compressed HeapsterSelectors.
	compressed := make([]heapsterSelector, 0)
	for entry, resourceType := range resourceTypeMap {
		newSelector := heapsterSelector{
			Path:               entry,
			Resources:          removeDuplicates(resourceMap[entry]), // remove duplicate resources so that they are not downloaded twice.
			Label:              labelMap[entry],
			TargetResourceType: resourceType,
		}
		compressed = append(compressed, newSelector)
	}
	return compressed, reverseMapping
}

func toMetricPoints(heapsterMetricPoint []heapster.MetricPoint) []metricapi.MetricPoint {
	metricPoints := make([]metricapi.MetricPoint, len(heapsterMetricPoint))
	for i, heapsterMP := range heapsterMetricPoint {
		metricPoints[i] = metricapi.MetricPoint{
			Value:     heapsterMP.Value,
			Timestamp: heapsterMP.Timestamp,
		}
	}

	return metricPoints
}
