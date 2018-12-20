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
 * @type {!Array<Object>}
 */
let stdData = [{value: 20}, {value: 30}, {value: 50}];

describe('AllocatedResourcesChart component controller', () => {
  /**
   * @type {!common/components/allocatedresourceschart/allocatedresourceschart_component.AllocatedResourcesChartController}
   */
  let ctrl;

  /** @type {!angular.JQLite} */
  let element;

  beforeEach(function() {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController) => {
      element = angular.element(document.createElement('div'));
      element.appendTo(document.body);
      ctrl = $componentController(
          'kdAllocatedResourcesChart', {$element: element}, {data: stdData},
          {colorpalette: ['#ff0', '#f00', '#00f']});
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
});
