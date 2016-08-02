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
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"fmt"
)


// these resources do not exist in heapster. Calculate metrics for them as a sum of metrics of contained resources
var DerivedResources = map[string]string{
	"deployments": "pods",
	"deamonsets": "pods",
	"replicasets": "pods",
	"replicationcontrollers": "pods",
}


func getFullNativeSelection(client k8sClient.Interface, dataQuery DataQuery) (NativeSelection, error) {
	if dataQuery.SummingResource == "" {
		return dataQuery.NativeSelection.Copy(), nil
	}
	var finalResourceList []string
	initialisedFinalResourceList := false
	resourceNameListGetter, isGetterPresent := ResourceNameGetters[dataQuery.SummingResource]
	if !isGetterPresent {
		return nil, fmt.Errorf(`Resource name list getter is not available for summing resource "%s"`, dataQuery.SummingResource)
	}
	for resourceName, resourceValueList := range dataQuery.DerivedSelection {
		if len(resourceValueList) == 0 {
			// maybe todo(@pdabkowski) - download all available resources here and remove error from query parse in case of empty derived RL
			return nil, fmt.Errorf("how did you get here?")
		}
		resourceList := []string{}
		for _, derivedResourceValue := range resourceValueList {
			matchedResourceNames, err  := resourceNameListGetter(client, resourceName, dataQuery.Namespace, derivedResourceValue)
			if err != nil {
				return nil, err
			}
			resourceList = append(resourceList, matchedResourceNames...)
		}
		// continuously calculate intersection between resource names
		if !initialisedFinalResourceList {
			finalResourceList = resourceList
		} else {
			temp := []string{}
			for _, resource := range resourceList {
				if isInsideArray(resource, finalResourceList) {
					temp = append(temp, resource)
				}
			}
			finalResourceList = temp
		}

	}

	if finalResourceList == nil || len(finalResourceList) == 0 {
		finalResourceList = []string{"No/Resources/Matched/Just/Download/Nothing"}
	}
	fullNativeSelection := dataQuery.NativeSelection.Copy()
	fullNativeSelection[dataQuery.SummingResource] = finalResourceList
	return fullNativeSelection, nil
}