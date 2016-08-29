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

import {axisSettings, metricDisplaySettings, TimeAxisType} from './graph_settings';

export class GraphController {
  /**
   * @ngInject
   * @param {!angular.Scope} $scope
   * @param {!angular.JQLite} $element
   */
  constructor($scope, $element) {
    /** @private {!angular.Scope} */
    this.scope_ = $scope;

    /** @private {!angular.JQLite} */
    this.element_ = $element;

    /**
     * List of pods. Initialized from the scope.
     * @export {!Array<!backendApi.Metric>}
     */
    this.metrics;
  }

  $onInit() {
    // draw graph if data is available
    if (this.metrics !== null && this.metrics.length !== 0) {
      this.generateGraph();
    }
  }

  /**
   * Generates graph given map of data points by metric name.
   * @private
   */
  generateGraph() {
    let chart;

    nv.addGraph(() => {
      // basic chart options - multiChart with interactive tooltip
      chart = nv.models.multiChart().margin({top: 30, right: 90, bottom: 60, left: 75}).options({
        duration: 300,
        tooltips: true,
        useInteractiveGuideline: true,
      });
      let data = [];
      let yAxis1Type;
      let yAxis2Type;
      let y1max = 1;
      let y2max = 1;
      // iterate over metrics and add them to graph display
      for (let metric of this.metrics) {
        // don't display metric if the number of its data points is smaller than 2
        if (metric.dataPoints.length < 2) {
          continue;
        }
        // check whether it's possible to display this metric
        if (metric.metricName in metricDisplaySettings) {
          let metricSettings = metricDisplaySettings[metric.metricName];
          if (metricSettings.yAxis === 1) {
            if (typeof yAxis1Type === 'undefined') {
              yAxis1Type = metricSettings.yAxisType;
            } else if (yAxis1Type !== metricSettings.yAxisType) {
              throw new Error(
                  'Can\'t display requested data - metrics have inconsistent types of y1 axis!');
            }
            y1max = Math.max(y1max, Math.max(...metric.dataPoints.map((e) => e.y)));
          } else {  // yAxis is 2
            if (typeof yAxis2Type === 'undefined') {
              yAxis2Type = metricSettings.yAxisType;
            } else if (yAxis2Type !== metricSettings.yAxisType) {
              throw new Error(
                  'Can\'t display requested data - metrics have inconsistent types of y2 axis!');
            }
            y2max = Math.max(y2max, Math.max(...metric.dataPoints.map((e) => e.y)));
          }
          data.push({
            'area': metricSettings.area,
            'values': metric.dataPoints,
            'key': metricSettings.key,
            'color': metricSettings.color,
            'fillOpacity': metricSettings.fillOpacity,
            'strokeWidth': metricSettings.strokeWidth,
            'type': metricSettings.type,
            'yAxis': metricSettings.yAxis,
          });
        }
      }

      // customise X axis (hardcoded time).
      let xAxisSettings = axisSettings[TimeAxisType];
      chart.xAxis.axisLabel(xAxisSettings.label)
          .tickFormat(xAxisSettings.formatter)
          .staggerLabels(true);

      // customise Y axes
      if (typeof yAxis1Type !== 'undefined') {
        let yAxis1Settings = axisSettings[yAxis1Type];
        chart.yAxis1.axisLabel(yAxis1Settings.label).tickFormat(yAxis1Settings.formatter);
        chart.yDomain1([0, y1max]);
      }
      if (typeof yAxis2Type !== 'undefined') {
        let yAxis2Settings = axisSettings[yAxis2Type];
        chart.yAxis2.axisLabel(yAxis2Settings.label).tickFormat(yAxis2Settings.formatter);
        chart.yDomain2([0, y2max]);
      }

      // hack to fix tooltip to use appropriate formatters instead of raw numbers.
      // d is the value to be formatted, tooltip_row_index is a index of a row in tooltip that is
      // being formatted.
      chart.interactiveLayer.tooltip.valueFormatter(function(d, tooltip_row_index) {
        let notDisabledMetrics = data.filter((e) => !e.disabled);
        if (tooltip_row_index < notDisabledMetrics.length) {
          return notDisabledMetrics[tooltip_row_index].yAxis === 1 ? chart.yAxis1.tickFormat()(d) :
                                                                     chart.yAxis2.tickFormat()(d);
        }
        // sometimes disabled property on data is updated slightly before tooltip is notified so we
        // may have wrong tooltip_row_index
        // in this case return raw value. Note - the period of time when unformatted value is
        // displayed is very brief -
        // too short to notice.
        return d;
      });

      // generate graph
      let graphArea = d3.select(this.element_[0]);
      let svg = graphArea.append('svg');
      svg.attr('height', '300px').datum(data).call(chart);

      // add grey line to the bottom to separate from the rest of the page.
      svg.style({
        'background-color': 'white',
        'border-bottom-style': 'solid',
        'border-bottom-width': '1px',
        'border-bottom-color': 'rgba(0, 0, 0, 0.117647)',
      });

      // update the graph in case of graph area resize
      nv.utils.windowResize(chart.update);
      this.scope_.$watch(
          () => graphArea.node().getBoundingClientRect().width,  // variable to watch
          () => setTimeout(chart.update, 500),  // TODO - this should be changed to just
                                                // chart.update after we implement different method
                                                // of left hand side nav animation (instant DOM
                                                // change).
          false                                 // not a deep watch
          );

      return chart;
    });
  }
}

/**
 * Definition object for the component that displays graph with CPU and Memory usage metrics.
 *
 * @type {!angular.Component}
 */
export const graphComponent = {
  bindings: {
    'metrics': '<',
  },
  controller: GraphController,
  templateUrl: 'common/components/graph/graph.html',
};
