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

package common

import (
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"fmt"
	"strings"
)



type MetricPromises []MetricPromise

func (self MetricPromises) GetMetrics() ([]Metric, error) {
	result := []Metric{}
	for _, metricPromise := range self {
		err := <- metricPromise.Error
		if err != nil {
			return nil, err
		}
		result = append(result, * <- metricPromise.Metric)
	}
	return result, nil
}

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

func NewMetricPromises(length int) MetricPromises {
	result := MetricPromises{}
	for i:=0;i<length;i++ {
		result = append(result, NewMetricPromise())
	}
	return result
}

// DataPromise is used for parallel data extraction. Contains len 1 channels for Data and Error.
type MetricPromise struct {
	Metric chan *Metric
	Error chan error
}

func (self MetricPromise) GetMetric() (*Metric, error) {
	err := <-self.Error
	if err != nil {
		return nil, err
	}
	return <-self.Metric, nil
}

func NewMetricPromise() MetricPromise {
	return MetricPromise{
		Metric: make(chan *Metric, 1),
		Error: make(chan error, 1),
	}
}
// Metric is a format of data used in this module. This is also the format of data that is being sent by backend API.
type Metric struct {
	DataPoints    `json:"dataPoints"`
	MetricName    string `json:"metricName"`
	Label         `json:"label"`
	// aggregating function used (if any)
	Aggregate string `json:"aggregate,omitempty"`
}

type DataPoints []DataPoint

type DataPoint struct {
	X int64 `json:"x"`
	Y int64    `json:"y"`
}

type Label map[MetricResourceType][]string

func (self Label) AddDataLabel(other Label) (Label) {
	if other == nil {
		return self
	}
	for k, v := range other {
		self[k] = append(self[k], v...)
	}
	return self
}
// Note DO NOT use aggregations other than sum after compressing!
func (self HeapsterSelectors) DownloadAndAggregate(client client.HeapsterClient, metricNames []string, aggregations []string) MetricPromises {
	result := MetricPromises{}
	for _, metricName := range metricNames {
		collectedMetrics := MetricPromises{}
		// if you compress heapster selectors then there will be very few selectors here (most likely just one )
		for _, heapsterSelector := range self {
			collectedMetrics = append(collectedMetrics, heapsterSelector.DownloadMetric(client, metricName))
		}
		result = append(result, AggregateMetricPromises(collectedMetrics, metricName, aggregations, nil)...)
	}
	return result
}

func (self HeapsterSelectors) Compress() (HeapsterSelectors) {
	if len(self) == 0 {
		return HeapsterSelectors{}
	}
	allInOneMap := map[string]bool{}
	resourceMap := map[string][]string{}
	labelMap := map[string]Label{}
	for _, selector := range self {
		entry := selector.Path
		resources, doesEntryExist := resourceMap[selector.Path]
		// compress resources
		resourceMap[entry] = append(resources, selector.Resources...)
		// compress labels
		if !doesEntryExist {
			allInOneMap[entry] = selector.AllInOneDownloadAllowed // this will be the same for all entries
			labelMap[entry] = Label{}
		}
		labelMap[entry].AddDataLabel(selector.Label)
	}
	compressed := HeapsterSelectors{}
	for entry, allInOneAllowed := range allInOneMap {
		newSelector := HeapsterSelector{
			Path: entry,
			Resources: resourceMap[entry],
			Label: labelMap[entry],
			AllInOneDownloadAllowed: allInOneAllowed,
		}
		compressed = append(compressed, newSelector)
	}
	return compressed

}

func HeapsterSelectorFromNativeResource(resourceType MetricResourceType, namespace string, resourceNames []string) (HeapsterSelector, error) {
	// Here we have 2 possibilities because this module allows downloading Nodes and Pods from heapster
	if resourceType == ResourceTypePod {
		return HeapsterSelector{
			Path: `namespaces/` + namespace + `/pod-list/`,
			Resources: resourceNames,
			Label: Label{resourceType:resourceNames},
			AllInOneDownloadAllowed: true,
		}, nil
	} else if resourceType == ResourceTypeNode {
		return HeapsterSelector{
			Path: `nodes/`,
			Resources: resourceNames,
			Label: Label{resourceType:resourceNames},
			AllInOneDownloadAllowed: false, // if you want to download all in one just set this to true. But make sure heapster supports it.
		}, nil
	} else {
		return HeapsterSelector{}, fmt.Errorf(`Resource "%s" is not a native heapster resource type or is not supported`, resourceType)
	}
}

// Takes a list of metric promises and returns a list of promises.
// NOTE: after use, the input argument metricPromises is no longer usable, therefore perform all your aggregations here
func AggregateMetricPromises(metricPromises MetricPromises, metricName string, aggregations []string, forceLabel Label) (MetricPromises) {
	if aggregations == nil || len(aggregations) == 0 {
		aggregations = DefaultAggregation
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
	Path string           `json:"heapsterPath"`
	Resources []string    `json:"resources"`
	Label             `json:"dataLabel"`
	AllInOneDownloadAllowed bool
}




func (self HeapsterSelector) DownloadMetrics(client client.HeapsterClient, metricNames []string) (MetricPromises) {
	result := MetricPromises{}
	for _, metricName := range metricNames {
		result = append(result, self.DownloadMetric(client, metricName))
	}
	return result
}

// DownloadMetric downloads one metric for this drill from heapster and returns it as a DataPromise
// Note, this may contain lots of data points.
func (self HeapsterSelector) DownloadMetric(client client.HeapsterClient, metricName string) (MetricPromise) {
	var notAggregatedMetrics MetricPromises
	if self.AllInOneDownloadAllowed {
		notAggregatedMetrics = self.allInOneDownload(client, metricName)
	} else {
		notAggregatedMetrics = MetricPromises{}
		for i := range self.Resources {
			notAggregatedMetrics = append(notAggregatedMetrics, self.ithResourceDownload(client, metricName, i))
		}
	}
	return AggregateMetricPromises(notAggregatedMetrics, metricName, []string{"sum"}, self.Label)[0]
}

func (self HeapsterSelector) ithResourceDownload(client client.HeapsterClient, metricName string, i int) (MetricPromise) {
	result := NewMetricPromise()
	go func() {
		rawResult := HeapsterJSONFormat{}
		err := HeapsterUnmarshalType(client, self.Path + self.Resources[i] + "/metrics/" + metricName, &rawResult)
		if err != nil {
			result.Metric <- nil
			result.Error <- err
			return
		}
		dataPoints, err := DataPointsFromMetricJSONFormat(rawResult)

		result.Metric <- &Metric{
			DataPoints: dataPoints,
			MetricName: metricName,
			Label: Label{},
		}
		result.Error <- err
		return
	}()
	return result
}


func (self HeapsterSelector) allInOneDownload(client client.HeapsterClient, metricName string) (MetricPromises) {
	result := NewMetricPromises(len(self.Resources))
	go func() {
		rawResults := HeapsterJSONAllInOneFormat{}
		err := HeapsterUnmarshalType(client, self.Path + strings.Join(self.Resources, ",") + "/metrics/" + metricName, &rawResults)
		if err != nil {
			result.PutMetrics(nil, err)
			return
		}
		if len(result) != len(rawResults.Items) {
			result.PutMetrics(nil, fmt.Errorf(`Received invalid number of resources from heapster. Expected %d received %d`, len(result), len(rawResults.Items)))
			return
		}

		for i, rawResult := range rawResults.Items {
			dataPoints, err := DataPointsFromMetricJSONFormat(rawResult)

			result[i].Metric <- &Metric{
				DataPoints: dataPoints,
				MetricName: metricName,
				Label: Label{},
			}
			result[i].Error <- err
		}
		return

	}()
	return result
}