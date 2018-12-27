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

package common

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"k8s.io/apimachinery/pkg/types"
)

func getMetricPromises(metrics []metricapi.Metric) metricapi.MetricPromises {
	metricPromises := metricapi.NewMetricPromises(len(metrics))
	metricPromises.PutMetrics(metrics, nil)
	return metricPromises
}

func TestAggregateMetricPromises(t *testing.T) {
	cases := []struct {
		info         string
		promises     metricapi.MetricPromises
		metricName   string
		aggregations metricapi.AggregationModes
		forceLabel   metricapi.Label
		expected     []metricapi.Metric
	}{
		{
			"should return empty metric when metric name not provided",
			getMetricPromises([]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1"},
					},
				},
			}),
			"",
			metricapi.OnlyDefaultAggregation,
			nil,
			[]metricapi.Metric{
				{
					DataPoints: metricapi.DataPoints{},
					MetricName: "",
					Label:      metricapi.Label{},
					Aggregate:  metricapi.SumAggregation,
				},
			},
		},
		{
			"should override label",
			getMetricPromises([]metricapi.Metric{}),
			"",
			metricapi.OnlyDefaultAggregation,
			metricapi.Label{api.ResourceKindPod: []types.UID{"overridden-uid"}},
			[]metricapi.Metric{
				{
					DataPoints:   metricapi.DataPoints{},
					MetricPoints: []metricapi.MetricPoint{},
					MetricName:   "",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"overridden-uid"},
					},
					Aggregate: metricapi.SumAggregation,
				},
			},
		},
		{
			"should use default aggregation mode when nothing is provided",
			getMetricPromises([]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1"},
					},
				},
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U2"},
					},
				},
			}),
			"test-metric",
			nil,
			nil,
			[]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 10},
						{X: 5, Y: 20},
						{X: 10, Y: 30},
					},
					MetricPoints: []metricapi.MetricPoint{},
					MetricName:   "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1", "U2"},
					},
					Aggregate: metricapi.SumAggregation,
				},
			},
		},
		{
			"should use sum aggregation mode",
			getMetricPromises([]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1"},
					},
				},
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U2"},
					},
				},
			}),
			"test-metric",
			metricapi.OnlySumAggregation,
			nil,
			[]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 10},
						{X: 5, Y: 20},
						{X: 10, Y: 30},
					},
					MetricPoints: []metricapi.MetricPoint{},
					MetricName:   "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1", "U2"},
					},
					Aggregate: metricapi.SumAggregation,
				},
			},
		},
		{
			"should use min aggregation mode",
			getMetricPromises([]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1"},
					},
				},
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 10},
						{X: 5, Y: 15},
						{X: 10, Y: 20},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U2"},
					},
				},
			}),
			"test-metric",
			metricapi.AggregationModes{metricapi.MinAggregation},
			nil,
			[]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricPoints: []metricapi.MetricPoint{},
					MetricName:   "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1", "U2"},
					},
					Aggregate: metricapi.MinAggregation,
				},
			},
		},
		{
			"should use max aggregation mode",
			getMetricPromises([]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 5},
						{X: 5, Y: 10},
						{X: 10, Y: 15},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1"},
					},
				},
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 10},
						{X: 5, Y: 15},
						{X: 10, Y: 20},
					},
					MetricName: "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U2"},
					},
				},
			}),
			"test-metric",
			metricapi.AggregationModes{metricapi.MaxAggregation},
			nil,
			[]metricapi.Metric{
				{
					DataPoints: []metricapi.DataPoint{
						{X: 0, Y: 10},
						{X: 5, Y: 15},
						{X: 10, Y: 20},
					},
					MetricPoints: []metricapi.MetricPoint{},
					MetricName:   "test-metric",
					Label: metricapi.Label{
						api.ResourceKindPod: []types.UID{"U1", "U2"},
					},
					Aggregate: metricapi.MaxAggregation,
				},
			},
		},
	}

	for _, c := range cases {
		promises := AggregateMetricPromises(c.promises, c.metricName, c.aggregations,
			c.forceLabel)
		metrics, _ := promises.GetMetrics()

		if !reflect.DeepEqual(metrics, c.expected) {
			t.Errorf("Test Case: %s. Failed to aggregate metrics. Expected: %+v, but got %+v",
				c.info, c.expected, metrics)
		}
	}
}
