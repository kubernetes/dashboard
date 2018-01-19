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
export class GraphCardController {
  /** @ngInject */
  constructor() {
    /** @export {!Array<!backendApi.Metric>} - Initialized from binding */
    this.metrics;

    /** @export {string} - Initialized from binding */
    this.graphTitle;

    /**
     * @export {string|undefined} - Comma separated list of metric names. Initialized from binding
     */
    this.selectedMetricNames;

    /** @export {!Array<!backendApi.Metric>}  */
    this.selectedMetrics;
  }

  $onInit() {
    this.selectedMetrics = this.getSelectedMetrics();
  }

  /**
   * Filters metrics by selectedMetricNames. If selectedMetricNames is undefined returns all
   * metrics.
   *
   * @private
   * @return {!Array<!backendApi.Metric>}
   */
  getSelectedMetrics() {
    if (typeof this.selectedMetricNames === 'undefined') {
      return this.metrics;
    }
    let selectedMetricNameList = this.selectedMetricNames.split(',');
    return this.metrics &&
        this.metrics.filter((metric) => selectedMetricNameList.indexOf(metric.metricName) !== -1);
  }

  /**
   * Hide graphs until all given metrics do not have 2 or more data points.
   *
   * @export
   * @return {boolean}
   */
  shouldShowGraph() {
    return this.metrics !== null && this.metrics.length > 0 &&
        this.metrics.filter((metric) => metric.dataPoints.length > 1).length ===
        this.metrics.length;
  }
}

/**
 * Definition object for the component that warps graph into graph card.
 *
 * @type {!angular.Component}
 */
export const graphCardComponent = {
  controller: GraphCardController,
  bindings: {
    'metrics': '<',
    'graphTitle': '@',
    'graphInfo': '@',
    'selectedMetricNames': '<',
  },
  templateUrl: 'common/components/graph/graphcard.html',
};
