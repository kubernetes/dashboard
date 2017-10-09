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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	heapster "k8s.io/heapster/metrics/api/v1/types"
)

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

	for entry, resources := range resourceMap {
		resourceMap[entry] = toUniqueSlice(resources)
	}

	// create new compressed HeapsterSelectors.
	compressed := make([]heapsterSelector, 0)
	for entry, resourceType := range resourceTypeMap {
		newSelector := heapsterSelector{
			Path:               entry,
			Resources:          resourceMap[entry],
			Label:              labelMap[entry],
			TargetResourceType: resourceType,
		}
		compressed = append(compressed, newSelector)
	}
	return compressed, reverseMapping
}

func toUniqueSlice(strings []string) []string {
	result := make([]string, 0)
	uniquenessMap := make(map[string]bool)
	for _, s := range strings {
		if _, exists := uniquenessMap[s]; !exists {
			result = append(result, s)
		}

		uniquenessMap[s] = true
	}

	return result
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
