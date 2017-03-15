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
	"fmt"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	heapster "k8s.io/heapster/metrics/api/v1/types"
)

type MetricPromises []MetricPromise

// GetMetrics returns all metrics from MetricPromises.
// In case of no metrics were downloaded it does not initialise []Metric and returns nil.
func (self MetricPromises) GetMetrics() ([]Metric, error) {
	result := make([]Metric, 0)

	for _, metricPromise := range self {
		metric, err := metricPromise.GetMetric()
		if err != nil {
			return nil, err
		}
		result = append(result, *metric)
	}

	return result, nil
}

// PutMetrics forwards provided list of metrics to all channels. If provided err is not nil, error will be forwarded.
func (self MetricPromises) PutMetrics(metrics []Metric, err error) {
	for i, metricPromise := range self {
		if err != nil {
			metricPromise.Metric <- nil
		} else {
			metricPromise.Metric <- &metrics[i]
		}
		metricPromise.Error <- err
	}
}

// NewMetricPromises returns a list of MetricPromises with requested length.
func NewMetricPromises(length int) MetricPromises {
	result := MetricPromises{}
	for i := 0; i < length; i++ {
		result = append(result, NewMetricPromise())
	}
	return result
}

// MetricPromise is used for parallel data extraction. Contains len 1 channels for Metric and Error.
type MetricPromise struct {
	Metric chan *Metric
	Error  chan error
}

// GetMetric returns pointer to received Metrics and forwarded error (if any)
func (self MetricPromise) GetMetric() (*Metric, error) {
	err := <-self.Error
	if err != nil {
		return nil, err
	}
	return <-self.Metric, nil
}

// NewMetricPromise creates a MetricPromise structure with both channels of length 1.
func NewMetricPromise() MetricPromise {
	return MetricPromise{
		Metric: make(chan *Metric, 1),
		Error:  make(chan error, 1),
	}
}

// Metric is a format of data used in this module. This is also the format of data that is being sent by backend API.
type Metric struct {
	// DataPoints is a list of X, Y int64 data points, sorted by X.
	DataPoints `json:"dataPoints"`
	// MetricName is the name of metric stored in this struct.
	MetricName string `json:"metricName"`
	// Label stores information about identity of resources described by this metric.
	Label `json:"-"`
	// Names of aggregating function used.
	Aggregate AggregationName `json:"aggregation,omitempty"`
}

type DataPoints []DataPoint

type DataPoint struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
}

// Label stores information about identity of resources described by this metric.
type Label map[common.ResourceKind][]string

// AddMetricLabel returns a combined Label of self and other resource. (new label describes both resources).
func (self Label) AddMetricLabel(other Label) Label {
	if other == nil {
		return self
	}
	for k, v := range other {
		self[k] = append(self[k], v...)
	}
	return self
}

// DownloadMetric downloads requested metric for each HeapsterSelector present in HeapsterSelectors and returns
// the result as MetricPromises - one promise for each HeapsterSelector. If HeapsterSelector consists of many native resources
// (eg. for example deployments can consist of hundreds of pods) then the sum for all its native resources is calculated.
// HeapsterSelectors are compressed before download process so that the smallest number of heapster requests is used.
func (self HeapsterSelectors) DownloadMetric(client client.HeapsterClient, metricName string) MetricPromises {
	// Downloads metric in the fastest possible way by first compressing HeapsterSelectors and later unpacking the result to separate boxes.
	compressedSelectors, reverseMapping := self.compress()

	// collect all the required data (as promises)
	unassignedResourcePromisesList := make([]MetricPromises, len(compressedSelectors))
	for selectorId, compressedSelector := range compressedSelectors {
		unassignedResourcePromisesList[selectorId] = compressedSelector.downloadMetricForEachTargetResource(client, metricName)

	}
	// prepare final result
	result := NewMetricPromises(len(self))
	// unpack downloaded data - this is threading safe because there is only one thread running.
	go func() {
		// unpack the data selector by selector.
		for selectorId, selector := range compressedSelectors {
			unassignedResourcePromises := unassignedResourcePromisesList[selectorId]
			// now unpack the resources and push errors in case of error.
			unassignedResources, err := unassignedResourcePromises.GetMetrics()
			if err != nil {
				for _, originalMappingIndex := range reverseMapping[selector.Path] {
					result[originalMappingIndex].Error <- err
					result[originalMappingIndex].Metric <- nil
				}
				continue
			}
			unassignedResourceMap := map[string]Metric{}
			for _, unassignedMetric := range unassignedResources {
				unassignedResourceMap[unassignedMetric.Label[selector.TargetResourceType][0]] = unassignedMetric
			}

			// now, if everything went ok, unpack the metrics into original selectors
			for _, originalMappingIndex := range reverseMapping[selector.Path] {
				// find out what resources this selector needs
				requestedResources := []Metric{}
				for _, requestedResourceName := range self[originalMappingIndex].Resources {
					requestedResources = append(requestedResources, unassignedResourceMap[requestedResourceName])
				}
				// aggregate the data for this resource

				aggregatedMetric := AggregateData(requestedResources, metricName, "sum")
				aggregatedMetric.Label = self[originalMappingIndex].Label
				result[originalMappingIndex].Metric <- &aggregatedMetric
				result[originalMappingIndex].Error <- nil
			}
		}
	}()
	return result
}

// DownloadAndAggregate downloads and aggregates requested metrics for all resources present in HeapsterSelectors.
// Each item in HeapsterSelectors is treated as a separate resource and aggregation reflects that - ie. first we calculate,
// metrics for every heapster selector separately and afterwards we aggregate the data.
// So for example, we have 2 HeapsterSelectors each one consisting of many pods. If aggregation MIN is specified, then
// first for each HeapsterSelector the sum of metrics of all its pods is calculated and afterwards the min is taken.
// This function downloads the data using smallest possible number of requests to Heapster and returns the result as MetricPromises.
func (self HeapsterSelectors) DownloadAndAggregate(client client.HeapsterClient, metricNames []string, aggregations AggregationNames) MetricPromises {
	result := MetricPromises{}
	for _, metricName := range metricNames {
		collectedMetrics := self.DownloadMetric(client, metricName)
		result = append(result, aggregateMetricPromises(collectedMetrics, metricName, aggregations, nil)...)
	}
	return result
}

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
func (self HeapsterSelectors) compress() (HeapsterSelectors, map[string][]int) {
	reverseMapping := map[string][]int{}
	resourceTypeMap := map[string]common.ResourceKind{}
	resourceMap := map[string][]string{}
	labelMap := map[string]Label{}
	for i, selector := range self {
		entry := selector.Path
		resources, doesEntryExist := resourceMap[selector.Path]
		// compress resources
		resourceMap[entry] = append(resources, selector.Resources...)
		// compress labels
		if !doesEntryExist {
			resourceTypeMap[entry] = selector.TargetResourceType // this will be the same for all entries
			labelMap[entry] = Label{}
		}
		labelMap[entry].AddMetricLabel(selector.Label)
		reverseMapping[entry] = append(reverseMapping[entry], i)
	}
	// create new compressed HeapsterSelectors.
	compressed := HeapsterSelectors{}
	for entry, resourceType := range resourceTypeMap {
		newSelector := HeapsterSelector{
			Path:               entry,
			Resources:          removeDuplicates(resourceMap[entry]), // remove duplicate resources so that they are not downloaded twice.
			Label:              labelMap[entry],
			TargetResourceType: resourceType,
		}
		compressed = append(compressed, newSelector)
	}
	return compressed, reverseMapping

}

// NewHeapsterSelectorFromNativeResource returns new heapster selector for native resources specified in arguments.
// returns error if requested resource is not native or is not supported.
func NewHeapsterSelectorFromNativeResource(resourceType common.ResourceKind, namespace string, resourceNames []string) (HeapsterSelector, error) {
	// Here we have 2 possibilities because this module allows downloading Nodes and Pods from heapster
	if resourceType == common.ResourceKindPod {
		return HeapsterSelector{
			TargetResourceType: common.ResourceKindPod,
			Path:               `namespaces/` + namespace + `/pod-list/`,
			Resources:          resourceNames,
			Label:              Label{resourceType: resourceNames},
		}, nil
	} else if resourceType == common.ResourceKindNode {
		return HeapsterSelector{
			TargetResourceType: common.ResourceKindNode,
			Path:               `nodes/`,
			Resources:          resourceNames,
			Label:              Label{resourceType: resourceNames},
		}, nil
	} else {
		return HeapsterSelector{}, fmt.Errorf(`Resource "%s" is not a native heapster resource type or is not supported`, resourceType)
	}
}

// aggregateMetricPromises takes a list of metric promises, aggregates the data as instructed and returns a new list of promises.
func aggregateMetricPromises(metricPromises MetricPromises, metricName string, aggregations AggregationNames, forceLabel Label) MetricPromises {
	if aggregations == nil || len(aggregations) == 0 {
		aggregations = OnlyDefaultAggregation
	}
	result := NewMetricPromises(len(aggregations))
	go func() {
		metricList, err := metricPromises.GetMetrics()
		if err != nil {
			result.PutMetrics(metricList, err)
			return
		}
		aggrResult := []Metric{}
		for _, aggregation := range aggregations {
			aggregated := AggregateData(metricList, metricName, aggregation)
			if forceLabel != nil {
				aggregated.Label = forceLabel
			}
			aggrResult = append(aggrResult, aggregated)
		}
		result.PutMetrics(aggrResult, nil)
	}()
	return result
}

type HeapsterSelectors []HeapsterSelector

type HeapsterSelector struct {
	TargetResourceType common.ResourceKind
	Path               string
	Resources          []string
	Label
}

// DownloadMetric downloads one metric for this drill from heapster and returns it as a DataPromise
// Note, if you want to download data for multiple selectors make sure to pack them into HeapsterSelectors object.
// HeapsterSelectors uses smart download process in order to perform smallest number of heapster requests.
func (self HeapsterSelector) DownloadMetric(client client.HeapsterClient, metricName string) MetricPromise {
	return aggregateMetricPromises(self.downloadMetricForEachTargetResource(client, metricName), metricName, OnlySumAggregation, self.Label)[0]
}

// downloadMetricForEachTargetResource downloads requested metric for each resource present in HeapsterSelector
// and returns the result as a list of promises - one promise for each resource. Order of promises returned is the same as order in self.Resources.
func (self HeapsterSelector) downloadMetricForEachTargetResource(client client.HeapsterClient, metricName string) MetricPromises {
	var notAggregatedMetrics MetricPromises
	if HeapsterAllInOneDownloadConfig[self.TargetResourceType] {
		notAggregatedMetrics = self.allInOneDownload(client, metricName)
	} else {
		notAggregatedMetrics = MetricPromises{}
		for i := range self.Resources {
			notAggregatedMetrics = append(notAggregatedMetrics, self.ithResourceDownload(client, metricName, i))
		}
	}
	return notAggregatedMetrics
}

// ithResourceDownload downloads metric for ith resource in self.Resources. Use only in case all in 1 download is not supported
// for this resource type.
func (self HeapsterSelector) ithResourceDownload(client client.HeapsterClient, metricName string, i int) MetricPromise {
	result := NewMetricPromise()
	go func() {
		rawResult := heapster.MetricResult{}
		err := HeapsterUnmarshalType(client, self.Path+self.Resources[i]+"/metrics/"+metricName, &rawResult)
		if err != nil {
			result.Metric <- nil
			result.Error <- err
			return
		}
		dataPoints := DataPointsFromMetricJSONFormat(rawResult)

		result.Metric <- &Metric{
			DataPoints: dataPoints,
			MetricName: metricName,
			Label: Label{
				self.TargetResourceType: []string{self.Resources[i]},
			},
		}
		result.Error <- nil
		return
	}()
	return result
}

// allInOneDownload downloads metrics for all resources present in self.Resources in one request.
// returns a list of metric promises - one promise for each resource. Order of self.Resources is preserved.
func (self HeapsterSelector) allInOneDownload(client client.HeapsterClient, metricName string) MetricPromises {
	result := NewMetricPromises(len(self.Resources))
	go func() {
		if len(self.Resources) == 0 {
			return
		}
		rawResults := heapster.MetricResultList{}
		err := HeapsterUnmarshalType(client, self.Path+strings.Join(self.Resources, ",")+"/metrics/"+metricName, &rawResults)
		if err != nil {
			result.PutMetrics(nil, err)
			return
		}
		if len(result) != len(rawResults.Items) {
			result.PutMetrics(nil, fmt.Errorf(`Received invalid number of resources from heapster. Expected %d received %d`, len(result), len(rawResults.Items)))
			return
		}

		for i, rawResult := range rawResults.Items {
			dataPoints := DataPointsFromMetricJSONFormat(rawResult)

			result[i].Metric <- &Metric{
				DataPoints: dataPoints,
				MetricName: metricName,
				Label: Label{
					self.TargetResourceType: []string{self.Resources[i]},
				},
			}
			result[i].Error <- nil
		}
		return

	}()
	return result
}
