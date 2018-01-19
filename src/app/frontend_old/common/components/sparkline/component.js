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

/**
 * @final
 */
export default class SparklineController {
  /**
   * Constructs sparkline controller.
   * @ngInject
   */
  constructor() {
    /**
     * An array of {backendAPI.MetricResult} objects. The timestamp
     * values of each object must be unique, and value must be greater
     * than or equal to zero.
     * @export {!Array<!backendApi.MetricResult>} Initialized from the scope.
     */
    this.timeseries;
  }

  /**
   * Formats the underlying series suitable for display as an SVG polygon.
   * @return {string}
   * @export
   */
  polygonPoints() {
    const series = this.timeseries.map(({timestamp, value}) => [Date.parse(timestamp), value]);
    const sorted = series.slice().sort((a, b) => a[0] - b[0]);
    /** @type {number} */
    const xShift = Math.min(...sorted.map((pt) => pt[0]));
    const shifted = sorted.map(([x, y]) => [x - xShift, y]);
    /** @type {number} */
    const xScale = Math.max(...shifted.map((pt) => pt[0])) || 1;
    /** @type {number} */
    const yScale = Math.max(...shifted.map((pt) => pt[1])) || 1;
    const scaled = shifted.map(([x, y]) => [x / xScale, y / yScale]);

    // Invert Y because SVG Y=0 is at the top, and we want low values
    // of Y to be closer to the bottom of the graphic
    return scaled.map(([x, y]) => `${x},${(1 - y)}`).join(' ');
  }
}

/**
 * Sparkline component definition.
 *
 * @type {!angular.Component}
 */
export const sparklineComponent = {
  bindings: {
    'timeseries': '<',
  },
  controller: SparklineController,
  controllerAs: 'sparklineCtrl',
  templateUrl: 'common/components/sparkline/sparkline.html',
  templateNamespace: 'svg',
};
