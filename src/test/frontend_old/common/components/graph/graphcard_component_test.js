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

import componentsModule from 'common/components/module';

/**
 * @type {!Array<!backendApi.Metric>}
 */
let stdMetrics = [
  {
    'dataPoints': [
      {'x': 1472219880, 'y': 50},
      {'x': 1472219940, 'y': 40},
      {'x': 1472220000, 'y': 48},
    ],
    'metricName': 'cpu/usage_rate',
    'aggregation': 'sum',
  },
  {
    'dataPoints': [
      {'x': 1472219880, 'y': 976666624},
      {'x': 1472219940, 'y': 976728064},
    ],
    'metricName': 'memory/usage',
    'aggregation': 'sum',
  },
];

/**
 * @type {!Array<!backendApi.Metric>}
 */
let metricsWithTooFewDataPoints = [
  {
    'dataPoints': [
      {'x': 1472219880, 'y': 50},
      {'x': 1472219940, 'y': 40},
    ],
    'metricName': 'cpu/usage_rate',
    'aggregation': 'sum',
  },
  {
    'dataPoints': [],
    'metricName': 'memory/usage',
    'aggregation': 'sum',
  },
];

describe('Graph card component controller', () => {
  /**
   * @type {!common/components/graph/graphcard_component.GraphCardController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdGraphCard', {}, {metrics: stdMetrics});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });
  it('should show graph card when there are metrics with at least 2 data points', () => {
    ctrl.metrics = stdMetrics;
    ctrl.$onInit();

    let expected = ctrl.shouldShowGraph();

    expect(expected).toBeTruthy();
  });

  it('should hide graph card when there are no metrics with at least 2 data points', () => {
    ctrl.metrics = metricsWithTooFewDataPoints;
    ctrl.$onInit();

    let expected = ctrl.shouldShowGraph();

    expect(expected).toBeFalsy();
  });

  it('should hide graph card when metrics were not provided', () => {
    ctrl.metrics = null;
    ctrl.$onInit();

    let expected = ctrl.shouldShowGraph();

    expect(expected).toBeFalsy();
  });

  it('should be able to select metrics by metric name - single metric', () => {
    ctrl.metrics = stdMetrics;
    ctrl.selectedMetricNames = 'memory/usage';
    ctrl.$onInit();

    let expected = ctrl.selectedMetrics.length;

    expect(expected).toEqual(1);
  });

  it('should be able to select metrics by metric name - multiple metrics', () => {
    ctrl.metrics = stdMetrics;
    ctrl.selectedMetricNames = 'memory/usage,cpu/usage_rate';
    ctrl.$onInit();

    let expected = ctrl.selectedMetrics.length;

    expect(expected).toEqual(2);
  });
});
