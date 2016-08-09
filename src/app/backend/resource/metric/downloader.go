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
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"fmt"
)

type HeapsterSelector struct {
	Path string
	Resources []string
	AllInOneDownloadAllowed bool
}


type MetricsOption struct {
	Metric string
	Aggregation string
}

type MetricsOptions struct {
	Options []MetricsOption
}

func HeapsterSelectorFromNativeResource(resourceType MetricResourceType, namespace string, resourceNames []string) (HeapsterSelector, error) {
	// Here we have 2 possibilities because this module allows downloading Nodes and Pods from heapster
	if resourceType == ResourceTypePod {
		return HeapsterSelector{
			Path: `namespaces/` + namespace + `/pod-list/`,
			Resources: resourceNames,
			AllInOneDownloadAllowed: true,
		}, nil
	} else if resourceType == ResourceTypeNode {
		return HeapsterSelector{
			Path: `nodes/`,
			Resources: resourceNames,
			AllInOneDownloadAllowed: false, // todo(@pdabkowski) make sure it is not possible to download all in 1
		}, nil
	} else {
		return HeapsterSelector{}, fmt.Errorf(`Resource "%s" is not a native heapster resource type or is not supported`, resourceType)
	}
}


func (self *HeapsterSelector) GetNotAggregatedData(graphOptions MetricsOption) {

}