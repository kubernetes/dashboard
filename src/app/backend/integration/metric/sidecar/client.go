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

package sidecar

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/common"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// Sidecar client implements MetricClient and Integration interfaces.
type sidecarClient struct {
	client SidecarRESTClient
}

// Implement Integration interface.

// HealthCheck implements integration app interface. See Integration interface for more information.
func (self sidecarClient) HealthCheck() error {
	if self.client == nil {
		return errors.New("Sidecar not configured")
	}

	return self.client.HealthCheck()
}

// ID implements integration app interface. See Integration interface for more information.
func (self sidecarClient) ID() integrationapi.IntegrationID {
	return integrationapi.SidecarIntegrationID
}

// Implement MetricClient interface

// DownloadMetrics implements metric client interface. See MetricClient for more information.
func (self sidecarClient) DownloadMetrics(selectors []metricapi.ResourceSelector,
	metricNames []string, cachedResources *metricapi.CachedResources) metricapi.MetricPromises {
	result := metricapi.MetricPromises{}
	for _, metricName := range metricNames {
		collectedMetrics := self.DownloadMetric(selectors, metricName, cachedResources)
		result = append(result, collectedMetrics...)
	}
	return result
}

// DownloadMetric implements metric client interface. See MetricClient for more information.
func (self sidecarClient) DownloadMetric(selectors []metricapi.ResourceSelector,
	metricName string, cachedResources *metricapi.CachedResources) metricapi.MetricPromises {
	sidecarSelectors := getSidecarSelectors(selectors, cachedResources)

	// Downloads metric in the fastest possible way by first compressing SidecarSelectors and later unpacking the result to separate boxes.
	compressedSelectors, reverseMapping := compress(sidecarSelectors)
	return self.downloadMetric(sidecarSelectors, compressedSelectors, reverseMapping, metricName)
}

// AggregateMetrics implements metric client interface. See MetricClient for more information.
func (self sidecarClient) AggregateMetrics(metrics metricapi.MetricPromises, metricName string,
	aggregations metricapi.AggregationModes) metricapi.MetricPromises {
	return common.AggregateMetricPromises(metrics, metricName, aggregations, nil)
}

func (self sidecarClient) downloadMetric(sidecarSelectors []sidecarSelector,
	compressedSelectors []sidecarSelector, reverseMapping map[string][]int,
	metricName string) metricapi.MetricPromises {
	// collect all the required data (as promises)
	unassignedResourcePromisesList := make([]metricapi.MetricPromises, len(compressedSelectors))
	for selectorId, compressedSelector := range compressedSelectors {
		unassignedResourcePromisesList[selectorId] =
			self.downloadMetricForEachTargetResource(compressedSelector, metricName)
	}
	// prepare final result
	result := metricapi.NewMetricPromises(len(sidecarSelectors))
	// unpack downloaded data - this is threading safe because there is only one thread running.

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
		unassignedResourceMap := map[types.UID]metricapi.Metric{}
		for _, unassignedMetric := range unassignedResources {
			unassignedResourceMap[unassignedMetric.
				Label[selector.TargetResourceType][0]] = unassignedMetric
		}

		// now, if everything went ok, unpack the metrics into original selectors
		for _, originalMappingIndex := range reverseMapping[selector.Path] {
			// find out what resources this selector needs
			requestedResources := []metricapi.Metric{}
			for _, requestedResourceUID := range sidecarSelectors[originalMappingIndex].
				Label[selector.TargetResourceType] {
				requestedResources = append(requestedResources,
					unassignedResourceMap[requestedResourceUID])
			}

			// aggregate the data for this resource
			aggregatedMetric := common.AggregateData(requestedResources, metricName, metricapi.SumAggregation)
			result[originalMappingIndex].Metric <- &aggregatedMetric
			result[originalMappingIndex].Error <- nil
		}
	}

	return result
}

// downloadMetricForEachTargetResource downloads requested metric for each resource present in SidecarSelector
// and returns the result as a list of promises - one promise for each resource. Order of promises returned is the same as order in self.Resources.
func (self sidecarClient) downloadMetricForEachTargetResource(selector sidecarSelector, metricName string) metricapi.MetricPromises {
	var notAggregatedMetrics metricapi.MetricPromises
	if SidecarAllInOneDownloadConfig[selector.TargetResourceType] {
		notAggregatedMetrics = self.allInOneDownload(selector, metricName)
	} else {
		notAggregatedMetrics = metricapi.MetricPromises{}
		for i := range selector.Resources {
			notAggregatedMetrics = append(notAggregatedMetrics, self.ithResourceDownload(selector, metricName, i))
		}
	}
	return notAggregatedMetrics
}

// ithResourceDownload downloads metric for ith resource in self.Resources. Use only in case all in 1 download is not supported
// for this resource type.
func (self sidecarClient) ithResourceDownload(selector sidecarSelector, metricName string,
	i int) metricapi.MetricPromise {
	result := metricapi.NewMetricPromise()
	go func() {
		rawResult := metricapi.SidecarMetricResultList{}
		err := self.unmarshalType(selector.Path+selector.Resources[i]+"/metrics/"+metricName, &rawResult)
		if err != nil {
			result.Metric <- nil
			result.Error <- err
			return
		}

		if len(rawResult.Items) == 0 {
			result.Metric <- nil
			result.Error <- nil
			return
		}

		dataPoints := DataPointsFromMetricJSONFormat(rawResult.Items[0].MetricPoints)

		result.Metric <- &metricapi.Metric{
			DataPoints:   dataPoints,
			MetricPoints: rawResult.Items[0].MetricPoints,
			MetricName:   metricName,
			Label: metricapi.Label{
				selector.TargetResourceType: []types.UID{
					selector.Label[selector.TargetResourceType][i],
				},
			},
		}
		result.Error <- nil
		return
	}()
	return result
}

// allInOneDownload downloads metrics for all resources present in self.Resources in one request.
// returns a list of metric promises - one promise for each resource. Order of self.Resources is preserved.
func (self sidecarClient) allInOneDownload(selector sidecarSelector, metricName string) metricapi.MetricPromises {
	result := metricapi.NewMetricPromises(len(selector.Resources))
	go func() {
		if len(selector.Resources) == 0 {
			return
		}
		rawResults := metricapi.SidecarMetricResultList{}

		err := self.unmarshalType(selector.Path+strings.Join(selector.Resources, ",")+"/metrics/"+metricName, &rawResults)

		if err != nil {
			result.PutMetrics(nil, err)
			return
		}

		if len(result) != len(rawResults.Items) {
			log.Printf(`received %d resources from sidecar instead of %d`, len(rawResults.Items), len(result))
		}

		// rawResult.Items have indefinite order.
		// So it needs to be sorted by order of selector.Resources.
		mappedResults := map[string]metricapi.SidecarMetric{}
		for _, rawResult := range rawResults.Items {
			if exists := len(rawResult.UIDs) > 0; exists {
				mappedResults[rawResult.UIDs[0]] = rawResult
			}
		}
		sortedResults := make([]metricapi.SidecarMetric, len(selector.Resources))
		for i, resource := range selector.Resources {
			if mappedResult, exists := mappedResults[resource]; exists {
				sortedResults[i] = mappedResult
			}
		}

		for i, rawResult := range sortedResults {
			dataPoints := DataPointsFromMetricJSONFormat(rawResult.MetricPoints)

			if rawResult.MetricName == "" && len(rawResult.UIDs) == 0 {
				result[i].Metric <- nil
				result[i].Error <- fmt.Errorf("can not get metrics for %s", selector.Resources[i])
				continue
			}
			result[i].Metric <- &metricapi.Metric{
				DataPoints:   dataPoints,
				MetricPoints: rawResult.MetricPoints,
				MetricName:   metricName,
				Label: metricapi.Label{
					selector.TargetResourceType: []types.UID{
						selector.Label[selector.TargetResourceType][i],
					},
				},
			}
			result[i].Error <- nil
		}
		return

	}()
	return result
}

// unmarshalType performs sidecar GET request to the specifies path and transfers
// the data to the interface provided.
func (self sidecarClient) unmarshalType(path string, v interface{}) error {
	rawData, err := self.client.Get("/api/v1/dashboard/" + path).DoRaw(context.TODO())
	if err != nil {
		return err
	}
	return json.Unmarshal(rawData, v)
}

// CreateSidecarClient creates new Sidecar client. When sidecarHost param is empty
// string the function assumes that it is running inside a Kubernetes cluster and connects via
// service proxy. sidecarHost param is in the format of protocol://address:port,
// e.g., http://localhost:8002.
func CreateSidecarClient(host string, k8sClient kubernetes.Interface) (
	metricapi.MetricClient, error) {

	if host == "" && k8sClient != nil {
		log.Print("Creating in-cluster Sidecar client")
		c := inClusterSidecarClient{client: k8sClient.CoreV1().RESTClient()}
		return sidecarClient{client: c}, nil
	}

	cfg := &rest.Config{Host: host, QPS: client.DefaultQPS, Burst: client.DefaultBurst}
	restClient, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return sidecarClient{}, err
	}
	log.Printf("Creating remote Sidecar client for %s", host)
	c := remoteSidecarClient{client: restClient.RESTClient()}
	return sidecarClient{client: c}, nil
}
