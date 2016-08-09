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

package metric

import (
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"fmt"
)


// DerivedResources do not exist in heapster. Calculate metrics for them as a sum of metrics of contained resources.
var DerivedResources = map[string]string{
	"deployments": "pods",
	"deamonsets": "pods",
	"replicasets": "pods",
	"replicationcontrollers": "pods",
}


// Converts dataQuery which contains derived resources (it is resources that
// are not available in heapster eg. deployments) to resources supported by heapster - to native heapster resources.
// The process is rather simple. If the user chose certain deployment for example deploymentXYZ then we will just download
// metrics for all pods belonging to that deployment and aggregate them to get the metrics for deploymentXYZ.
func getFullNativeSelection(client k8sClient.Interface, dataQuery DataQuery) (NativeSelection, error) {
	// Check if query contains any derived resources. If not then no conversion is required and just return
	// its native selection.
	if dataQuery.SummingResource == "" {
		return dataQuery.NativeSelection.Copy(), nil
	}
	// List containing a list of names of summingResource that should be downloaded
	var finalResourceList []string
	initialisedFinalResourceList := false
	// resource name getter that translates derived resource to the list of contained native resources
	resourceNameListGetter, isGetterPresent := ResourceNameGetters[dataQuery.SummingResource]
	if !isGetterPresent {
		return nil, fmt.Errorf(`Resource name list getter is not available for summing resource "%s"`, dataQuery.SummingResource)
	}
	for resourceName, resourceValueList := range dataQuery.DerivedSelection {
		if len(resourceValueList) == 0 {
			// maybe todo(@pdabkowski) - download all available resources here and remove error from query parse in case of empty derived resource list
			return nil, fmt.Errorf("how did you get here?")
		}
		resourceList := []string{}
		for _, derivedResourceValue := range resourceValueList {
			matchedResourceNames, err  := resourceNameListGetter(client, resourceName, dataQuery.Namespace, derivedResourceValue)
			if err != nil { // todo(@pdabkowski) - maybe just ignore the error if a resource could not be found?...
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
	// Check if any resource satisfies the query. If no resources satisfied the query then dont download anything.
	// Unfortunately if we return empty list then data downloader will download all the resources so we have
	// to use trick to not download anything - just return invalid name
	if finalResourceList == nil || len(finalResourceList) == 0 {
		finalResourceList = []string{"No/Resources/Matched/Just/Download/Nothing"}
	}

	// Instruct data downloader to download matched native resources.
	fullNativeSelection := dataQuery.NativeSelection.Copy()
	fullNativeSelection[dataQuery.SummingResource] = finalResourceList
	return fullNativeSelection, nil
}
