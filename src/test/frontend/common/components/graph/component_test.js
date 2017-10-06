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

function isIE11() {
  return /Trident/.test(window.navigator.userAgent);
}

describe('Graph component controller', () => {
  /**
   * @type {!common/components/graph/graph_component.GraphController}
   */
  let ctrl;

  /** @type {!angular.JQLite} */
  let element;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController) => {
      element = angular.element(document.createElement('div'));
      element.appendTo(document.body);
      ctrl = $componentController('kdGraph', {$element: element}, {metrics: stdMetrics});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });
  it('should render svg graph inside parent element', () => {
    ctrl.$onInit();
    nv.render.queue.pop().generate();
    expect(element.children(':first').is('svg')).toBeTruthy();
  });
  it('should not render graph if metrics are null', () => {
    ctrl.metrics = null;
    ctrl.$onInit();
    if (nv.render.queue.length > 0) {
      nv.render.queue.pop().generate();
    }
    expect(element.children(':first').is('svg')).toBeFalsy();
  });
  it('should not render graph if metrics were empty', () => {
    ctrl.metrics = [];
    ctrl.$onInit();
    if (nv.render.queue.length > 0) {
      nv.render.queue.pop().generate();
    }
    expect(element.children(':first').is('svg')).toBeFalsy();
  });
  it('should render a graph with correct number of data points', () => {
    if (isIE11()) {
      // skip the test if IE 11
      return;
    }
    ctrl.$onInit();
    nv.render.queue.pop().generate();
    expect(element.find('.lines1Wrap path.nv-line').attr('d').split(',').length).toEqual(4);
    expect(element.find('.lines2Wrap path.nv-line').attr('d').split(',').length).toEqual(3);

  });
  it('should only render metrics with at least 2 data points and use only left axis if free.',
     () => {
       if (isIE11()) {
         // skip the test if IE 11
         return;
       }
       ctrl.metrics = metricsWithTooFewDataPoints;
       ctrl.$onInit();
       nv.render.queue.pop().generate();
       expect(element.find('.lines1Wrap path.nv-line').attr('d').split(',').length).toEqual(3);
       expect(element.find('.lines2Wrap path.nv-line').attr('d')).toBeUndefined();

     });
  it('- Y axes should be from 0 to max', () => {
    ctrl.$onInit();
    nv.render.queue.pop().generate();
    // y1
    expect(element.find('.nv-y1 .nv-axisMin-y > text').text()).toEqual('0');
    expect(element.find('.nv-y1 .nv-axisMax-y > text').text()).toEqual('0.056');
    // y2
    expect(element.find('.nv-y2 .nv-axisMin-y > text').text()).toEqual('0');
    expect(element.find('.nv-y2 .nv-axisMax-y > text').text()).toEqual('1.05 Gi');
  });
  it('- X axis should have correct tick format', () => {
    ctrl.$onInit();
    nv.render.queue.pop().generate();
    expect(element.find('.nv-x .nv-axisMin-x > text').text()).toMatch(/\d?\d:58/);
    expect(element.find('.nv-x .nv-axisMax-x > text').text()).toMatch(/\d?\d:00/);
  });
});
