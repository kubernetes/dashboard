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
import SparklineController from 'common/components/sparkline/component';

describe('Sparkline controller', () => {
  /**
   * @type {!SparklineController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(SparklineController);
    });
  });

  it('should produce no points with an empty series', () => {
    // given
    ctrl.timeseries = [];

    // then
    expect(ctrl.polygonPoints()).toBe('');
  });

  it('should shift and scale times such that the minimum time is zero and the maximum time is 1',
     () => {
       // given
       ctrl.timeseries = [
         {timestamp: '1976-01-15T00:00:00Z', value: 1},
         {timestamp: '2026-01-15T00:00:00Z', value: 1},
       ];

       // then
       expect(ctrl.polygonPoints()).toBe('0,0 1,0');
     });

  it('should handle zero values and times without throwing an exception', () => {
    // given
    ctrl.timeseries = [
      {timestamp: '1970-01-01T00:00:00Z', value: 0},
    ];

    // then
    expect(ctrl.polygonPoints()).toBe('0,1');
  });

  it('should scale values to <= 1 and invert them', () => {
    // given
    ctrl.timeseries = [
      {timestamp: '1976-01-15T10:00:00Z', value: 10},
      {timestamp: '1976-01-15T10:00:10Z', value: 1},
    ];

    // then
    expect(ctrl.polygonPoints()).toBe('0,0 1,0.9');
  });

  it('should sort a time series by time', () => {
    // given
    ctrl.timeseries = [
      {timestamp: '1976-01-15T10:00:10Z', value: 1},
      {timestamp: '1976-01-15T10:00:00Z', value: 10},
    ];

    // then
    expect(ctrl.polygonPoints()).toBe('0,0 1,0.9');
  });
});
