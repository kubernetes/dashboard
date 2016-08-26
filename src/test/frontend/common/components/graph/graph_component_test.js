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

import {formatCpuUsage, formatMemoryUsage, getDataPointsByMetricName, GraphController} from 'common/components/graph/graph_component';


describe('Pod card list controller', () => {
  /**
   * @type {!common/components/graph/graph_component.GraphController}
   */
  let ctrl;
  /**
   * @type {!Array<!backendApi.Metric>}
   */
  let metrics = [
    {
      'dataPoints': [
        {'x': 1472134320, 'y': 32},
      ],
      'metricName': 'cpu/usage_rate',
      'aggregation': 'sum',
    },
    {
      'dataPoints': [
        {'x': 1472134320, 'y': 761946112},
      ],
      'metricName': 'memory/usage',
      'aggregation': 'sum',
    },
  ];

  beforeEach(() => {
    angular.mock.module(podsListModule.name);
    angular.mock.module(podDetailModule.name);

    angular.mock.inject(($componentController, $rootScope, kdNamespaceService) => {
      /** @type {!./../common/namespace/namespace_service.NamespaceService} */
      data = kdNamespaceService;
      /** @type {!podCardListController} */
      ctrl = $componentController(
          'kdPodCardList', {$scope: $rootScope, kdNamespaceService_: data}, {});
    });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should return the value from Namespace service', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(data.areMultipleNamespacesSelected());
  });

  it('should execute logs href callback function', () => {
    expect(ctrl.getPodDetailHref({
      objectMeta: {
        name: 'foo-pod',
        namespace: 'foo-namespace',
      },
    })).toBe('#/pod/foo-namespace/foo-pod');
  });
})


describe('Memory usage value formatter', () => {
  it('should format memory', () => {
    expect(formatMemoryUsage(null)).toEqual('N/A');
    expect(formatMemoryUsage(0)).toEqual('0');
    expect(formatMemoryUsage(1)).toEqual('1.00');
    expect(formatMemoryUsage(2)).toEqual('2.00');
    expect(formatMemoryUsage(1000)).toEqual('1,000');
    expect(formatMemoryUsage(1024)).toEqual('1,020');
    expect(formatMemoryUsage(1025)).toEqual('1.00 Ki');
    expect(formatMemoryUsage(7896)).toEqual('7.71 Ki');
    expect(formatMemoryUsage(109809)).toEqual('107 Ki');
    expect(formatMemoryUsage(768689899)).toEqual('733 Mi');
    expect(formatMemoryUsage(768689899789)).toEqual('716 Gi');
    expect(formatMemoryUsage(76868989978978)).toEqual('69.9 Ti');
    expect(formatMemoryUsage(7686898997897878)).toEqual('6.83 Pi');
    expect(formatMemoryUsage(768689899789787867898766)).toEqual('683,000,000 Pi');
  });
});

describe('CPU usage value formatter', () => {
  it('should format memory', () => {
    expect(formatMemoryUsage(null)).toEqual('N/A');
    expect(formatCpuUsage(0)).toEqual('0');
    expect(formatCpuUsage(1)).toEqual('0.001');
    expect(formatCpuUsage(2)).toEqual('0.002');
    expect(formatCpuUsage(11)).toEqual('0.011');
    expect(formatCpuUsage(100)).toEqual('0.100');
    expect(formatCpuUsage(140)).toEqual('0.140');
    expect(formatCpuUsage(1000)).toEqual('1.00');
    expect(formatCpuUsage(1024)).toEqual('1.02');
    expect(formatCpuUsage(1025)).toEqual('1.02');
    expect(formatCpuUsage(7896)).toEqual('7.90');
    expect(formatCpuUsage(109809)).toEqual('110');
    expect(formatCpuUsage(768689899)).toEqual('769 k');
    expect(formatCpuUsage(768689899789)).toEqual('769 M');
    expect(formatCpuUsage(76868989978978)).toEqual('76.9 G');
    expect(formatCpuUsage(7686898997897878)).toEqual('7.69 T');
    expect(formatCpuUsage(76868989978978876876876468543578)).toEqual('76,900,000,000,000,000 T');
  });
});

describe('Conversion of list of metrics to map of metric names to data points.', () => {
  let metrics = [
    {
      'dataPoints': [
        {'x': 1472134320, 'y': 32},
      ],
      'metricName': 'cpu/usage_rate',
      'aggregation': 'sum',
    },
    {
      'dataPoints': [
        {'x': 1472134320, 'y': 761946112},
      ],
      'metricName': 'memory/usage',
      'aggregation': 'sum',
    },
  ];
  it('should format memory', () => {
    expect(getDataPointsByMetricName({})).toEqual({});
    expect(getDataPointsByMetricName(metrics.slice(0, 1))).toEqual({
      'cpu/usage_rate': [{x: 1472134320, y: 32}],
    });
    expect(getDataPointsByMetricName(metrics)).toEqual({
      'cpu/usage_rate': [{x: 1472134320, y: 32}],
      'memory/usage': [{x: 1472134320, y: 761946112}],
    });
  });
});
