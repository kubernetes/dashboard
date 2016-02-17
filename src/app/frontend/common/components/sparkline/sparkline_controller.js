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

/**
 * @final
 */
export default class sparklineController {
  /**
   * Constructs sparkline controller.
   * @ngInject
   */
  constructor($scope) {
    /**
     * An array of [x,y] pairs. The first values of each pair must be
     * unique, and the second value must be greater than or equal to
     * zero. Exactly one of series or timeseries should be specified by
     * the scope.
     * @export {!Array<!Array<number>>} Initialized from the scope.
     */
    this.series;

    /**
     * An array of {backendAPI.MetricResult} objects. The timestamp
     * values of each object must be unique, and value must be greater
     * than or equal to zero. Exactly one of series or timeseries
     * should be specified by the scope.
     * @export {!Array<!backendApi.MetricResult>} Initialized from the scope.
     */
    this.timeseries;

    $scope.$watch('timeseries', this.onSeriesUpdate_.bind(this), true);
    $scope.$watch('series', this.onSeriesUpdate_.bind(this), true);
  }

  /**
   * Formats the underlying series suitable for display as an SVG polygon.
   * @return string
   * @export
   */
  polygonPoints(series) {
    const sorted = series.slice().sort((a,b) => a[0] - b[0]);
    const xShift = Math.min(...sorted.map(([x,_]) => x));
    const shifted = sorted.map(([x,y]) => [x - xShift, y]);
    const xScale = Math.max(...shifted.map(([x,_]) => x)) || 1;
    const yScale = Math.max(...shifted.map(([_,y]) => y)) || 1;
    const scaled = shifted.map(([x,y]) => [x/xScale, y/yScale]);
    return scaled.map(([x,y]) => x + ',' + (1 - y)).join(' ');
  }

  /**
   * Renders a series of coordinates into properties that can be used
   * to see those coordinates as a sparkline.
   * @private
   */
  onSeriesUpdate_() {
    if (this.timeseries) {
      this.series = this.timeseries.map(({timestamp, value}) => [Date.parse(timestamp), value]);
    }

    const sorted = this.series.slice().sort((a,b) => a[0] - b[0]);
    if (sorted.find(([_,y]) => y < 0)) {
      throw new Error(
        "sparkline doesn't support negative y values"
      );
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i][0] == sorted[i + 1][0]) {
        throw new Error(
          "sparkline doesn't support duplicate x values"
        )
      }
    }
  }
}
