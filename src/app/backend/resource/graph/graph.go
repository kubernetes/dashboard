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





func CollectHeapsterData(heapsterClient client.HeapsterClient, s NativeSelection, metrics Metrics) (DataList, error) {

	resolutionOrder := FakeDrillFromSelection(s).GetResourceResolutionOrder()
	drill := Drill{}
	depth := 0

	extractedDataPromiseList, err := extractAll(heapsterClient, s, resolutionOrder, drill, depth, metrics)
	if err != nil {
		return nil, err
	}
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

func extractAll(heapsterClient client.HeapsterClient, s NativeSelection, resolutionOrder []string, drill Drill, depth int, m Metrics) ([]DataPromise, error) {
	if len(resolutionOrder) == depth {
		// download metrics and return
		return drill.DownloadMetrics(heapsterClient, m), nil
	} else {
		// we have to go deeper
		resourceName := resolutionOrder[depth]
		var toExtract []string
		var err error
		if len(s[resourceName]) == 0 {
			// select all available resources
			toExtract, err = drill.GetAvailableResources(heapsterClient, resourceName)
			if err != nil {
				return nil, err
			}
		} else {
			toExtract = s[resourceName]
			err = nil
		}
		result := []DataPromise{}
		for _, resourceValue := range toExtract {
			deeperdrill := drill.Copy()
			deeperdrill[resourceName] = resourceValue
			extracted, err := extractAll(heapsterClient, s, resolutionOrder, deeperdrill, depth + 1, m)
			if err != nil {
				return nil, err
			}
			result = append(result, extracted...)
		}
		return result, nil

	}
}





