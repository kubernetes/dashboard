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
	"github.com/kubernetes/dashboard/src/app/backend/client"
)

// Downloader function that can talk and download data from heapster.
// Heapster understands only few resources - pods, nodes, namespaces, containers - so you can only download these resources
// (I call them native resources). This is quite limiting because,  we also want to download data for other resources.
// In case you want to download data for resources not present in heapster (derived resources) you can use
// ExecuteDataQueries function which accepts accepts more complex queries and supports download of derived resources by
// simply translating derived resources to native resources.
func CollectHeapsterData(heapsterClient client.HeapsterClient, nativeSelection NativeSelection, metrics Metrics) (DataList, error) {
        // Depending on the query there is a specific order in which resources should be requested from heapster
	// determine this order here
	resolutionOrder := FakeDrillFromSelection(nativeSelection).GetResourceResolutionOrder()
	drill := Drill{}
	depth := 0

	extractedDataPromiseList, err := extractAll(heapsterClient, nativeSelection, resolutionOrder, drill, depth, metrics)
	if err != nil {
		return nil, err
	}
	// extract the data from DataPromise channels.
	extractedDataList := DataList{}
	for _, dataPromise := range extractedDataPromiseList {
		err := <- dataPromise.Error
		if err != nil {
			return nil, err
		}
		extractedDataList = append(extractedDataList, *(<- dataPromise.Data))
	}
	return extractedDataList, nil
}

// Helper function for CollectHeapsterData. Downloads all the data and returns a DataPromise list (download is done in parallel).
func extractAll(heapsterClient client.HeapsterClient, nativeSelection NativeSelection, resolutionOrder []string, drill Drill, depth int, m Metrics) ([]DataPromise, error) {
	if len(resolutionOrder) == depth {
		// download metrics and return
		return drill.DownloadMetrics(heapsterClient, m), nil
	} else {
		// we have to go deeper to reach requested resource download type.
		resourceName := resolutionOrder[depth]
		var toExtract []string
		var err error
		if len(nativeSelection[resourceName]) == 0 {
			// if no resourceName provided then just select all available resources
			toExtract, err = drill.GetAvailableResources(heapsterClient, resourceName)
			if err != nil {
				return nil, err
			}
		} else {
			toExtract = nativeSelection[resourceName]
			err = nil
		}
		result := []DataPromise{}
		// collect and aggregate data for all the resources from toExtract.
		for _, resourceValue := range toExtract {
			deeperdrill := drill.Copy()
			deeperdrill[resourceName] = resourceValue
			extracted, err := extractAll(heapsterClient, nativeSelection, resolutionOrder, deeperdrill, depth + 1, m)
			if err != nil {
				return nil, err
			}
			result = append(result, extracted...)
		}
		return result, nil
	}
}
