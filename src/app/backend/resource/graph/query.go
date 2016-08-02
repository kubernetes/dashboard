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
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"strings"
	"errors"
	"fmt"
)

// Query containing data download and processing instructions
type DataQuery struct {
	Namespace        string
	SummingResource  string
	NativeSelection  NativeSelection
	DerivedSelection DerivedSelection
	Aggregate        Aggregate
	Metrics          Metrics
	RawDrill         *Drill
}

// Struct holding DataList and error channels.
type DataListPromise struct {
	List chan DataList
	Error chan error
}

// Unfortunately, resource names are not unique across different namespaces so we have to convert selector with
// multiple namespaces into selectors with one namespace each
func expandNamespaces(query DataQuery) ([]DataQuery, error) {
	namespaces, isNamespacesPresent := query.NativeSelection["namespaces"]
	if !isNamespacesPresent {
		return nil, errors.New(`namespaces must be specified in graph query, if you want all user namespaces just leave the field empty ie. namespaces=`)
	} else if len(namespaces) == 0 {
		return nil, errors.New(`Sorry, all user namespaces option is not supported yet, please specify the namespaces manually!`)
	}
	queries := []DataQuery{}
	for _, namespace := range namespaces {
		newQuery := DataQuery{
			Namespace:         query.Namespace,
			SummingResource:   query.SummingResource,
			NativeSelection:   query.NativeSelection.Copy(),
			DerivedSelection:  query.DerivedSelection,
			Aggregate:         query.Aggregate,
			Metrics:           query.Metrics,
			RawDrill:          query.RawDrill,
		}

		newQuery.NativeSelection["namespaces"] = []string{namespace}
		newQuery.Namespace = namespace

		queries = append(queries, newQuery)
	}
	return queries, nil
}

// Executes single data query and returns a data promise list (done in parallel).
// NOTE: does not process the data - only downloads.
func executeDataQuery(heapsterClient client.HeapsterClient, client k8sClient.Interface, dataQuery DataQuery) (DataListPromise) {
	dataListPromise := DataListPromise{
		List:  make(chan DataList, 1),
		Error: make(chan error, 1),
	}
	go func() {
		translatedSelection, err := getFullNativeSelection(client, dataQuery)
		if err != nil {
			dataListPromise.List <- nil
			dataListPromise.Error <- err
			return
		}
		dataList, err := CollectHeapsterData(heapsterClient, translatedSelection, dataQuery.Metrics)
		dataListPromise.List <- dataList
		dataListPromise.Error <- err
	}()
	return dataListPromise
}


// Downloads all the required data in parallel and processes resulting data as instructed in data query.
func ExecuteDataQueries(heapsterClient client.HeapsterClient, client k8sClient.Interface, dataQueries []DataQuery) (DataList, error) {
	if dataQueries == nil || len(dataQueries) == 0 {
		return nil, nil
	}
	dataListPromiseList := []DataListPromise{}
	for _, dataQuery := range dataQueries {
		dataListPromiseList = append(dataListPromiseList, executeDataQuery(heapsterClient, client, dataQuery))
	}
	dataList := DataList{}
	for _, dataListPromise := range dataListPromiseList {
		err := <- dataListPromise.Error
		if err != nil {
			return nil, err
		}
		dataList = append(dataList, (<- dataListPromise.List)...)
	}
	aggregate := dataQueries[0].Aggregate
	if len(aggregate) == 0 {
		return dataList, nil
	}
	// Aggregate everything
	aggregatedDataList := DataList{}
	for _, aggregateName := range aggregate {
		aggregatedDataList = append(aggregatedDataList, AggregateData(dataList, dataQueries[0].Metrics,
			aggregateName, dataQueries[0].RawDrill)...)
	}
	return aggregatedDataList, nil
}

// Executes raw query from the GET request and returns resulting data list.
func ExecuteRawQuery(heapsterClient client.HeapsterClient, client k8sClient.Interface, raw_query map[string][]string) (DataList, error) {
	dataQueries, err := ParseQuery(client, raw_query)
	if err != nil {
		return nil, err
	}
	return ExecuteDataQueries(heapsterClient, client, dataQueries)
}

// Parses query from the GET request and returns DataQuery list which is accepted by downloader function.
func ParseQuery(client k8sClient.Interface, q map[string][]string) ([]DataQuery, error) {
	baseDataQuery := DataQuery{}

	// Native resources
	native := NativeSelection{}
	for k, v := range q {
		_, isResourceName := NativeResourceDependencies[k]
		if isResourceName {
			if v == nil || len(v) == 0 || v[0] == "" {
				native[k] = []string{}
			} else {
				native[k] = strings.Split(v[0], ",")
			}
		}
	}
	baseDataQuery.NativeSelection = native
	baseDataQuery.RawDrill = FakeDrillFromSelection(native)

	// Metrics
	metrics, metricsPresent := q["metrics"]
	if !metricsPresent || len(metrics) == 0 {
		metrics = []string{}
	} else {
		metrics = strings.Split(metrics[0], ",")
	}
	baseDataQuery.Metrics = metrics

	// Aggregate
	aggregate, aggregatePresent := q["aggregate"]
	if !aggregatePresent || len(aggregate) == 0 {
		aggregate = []string{}
	} else {
		aggregate = strings.Split(aggregate[0], ",")
	}
	baseDataQuery.Aggregate = aggregate

	// Derived resources
	derived := DerivedSelection{}
	summingResource := ""
	for k, v := range q {
		_, isDerivedResourceName := DerivedResources[k]
		if isDerivedResourceName {
			if summingResource == "" {
				summingResource = DerivedResources[k]
			} else if DerivedResources[k] != summingResource {
				// cannot sum incompatible resources
				return nil, fmt.Errorf(`Some of chosen derived resources use conflicting summing resources: "%s" and "%s"`, k, summingResource)
			}
			if v == nil || len(v) == 0 || v[0] == "" {
				return nil, fmt.Errorf(`Getting all resources by specifying empty derived resource "%s" is not yet supported!`, k)
			} else {
				derived[k] = strings.Split(v[0], ",")
			}
		}
	}
	if summingResource == "" {  // no derived resources, simple query
		baseDataQuery.DerivedSelection = derived
	} else {  // query uses derived resources that have to be translated to native resources later
		// validate NativeResources selection...
		summingDependencies, _, err := ResolveDependency(summingResource, []string{}, []string{}, NativeResourceDependencies)
		if err != nil {
			return nil, err
		}

		for k, v := range baseDataQuery.NativeSelection {
			if !isInsideArray(k, summingDependencies) {
				return nil, fmt.Errorf(`Resource "%s" is conflicting with summing resource "%s"`, k, summingResource)
			} else if k == summingResource && len(v) != 0 {
				return nil, fmt.Errorf(`Forbidden to specify resources for summing resource "%s"`, summingResource)
			}
		}
		baseDataQuery.DerivedSelection = derived
		baseDataQuery.SummingResource = summingResource
	}
	return expandNamespaces(baseDataQuery)
}
