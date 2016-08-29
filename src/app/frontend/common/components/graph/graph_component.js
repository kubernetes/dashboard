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

import coresFilter from 'common/filters/cores_filter';
import memoryFilter from 'common/filters/memory_filter';

/**
 * Formats the number to contain ideally 3 significant figures, but at most 3 decimal places.
 * @param {number} d
 * @return {string}
 */
function precisionFilter(d) {
  if (d >= 1000) {
    return d3.format(',')(d.toPrecision(3));
  }
  if (d < 0.01) {
    return d.toPrecision(1);
  } else if (d < 0.1) {
    return d.toPrecision(2);
  }
  return d.toPrecision(3);
}

/**
 * Returns formatted memory usage value.
 * @param {number} d
 * @return {string}
 */
export function formatMemoryUsage(d) {
  return d === null ? 'N/A' : memoryFilter(precisionFilter)(d);
}

/**
 * Returns formatted CPU usage value.
 * @param {number} d
 * @return {string}
 */
export function formatCpuUsage(d) {
  return d === null ? 'N/A' : coresFilter(precisionFilter)(d);
}

/**
 * Converts list of metrics to a map containing dataPoints by metricName.
 * @param {!Array<!backendApi.Metric>} metrics
 * @return {!Object<string, !Array<!backendApi.DataPoint>>}
 */
export function getDataPointsByMetricName(metrics) {
  // extract data points by metric name
  let dataPoints = {};
  for (let i = 0; i < metrics.length; i++) {
    let metric = metrics[i];
    dataPoints[metric.metricName] = metric.dataPoints;
  }
  return dataPoints;
}

class GraphController {
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
    let dataPointsByMetricName = getDataPointsByMetricName(this.metrics);
    // draw graph if data is available
    if (Object.keys(dataPointsByMetricName).length !== 0) {
      this.generateGraph(dataPointsByMetricName);
    }
  }

  generateGraph(parsedGraphData) {
    let chart;
    let data;

    nv.addGraph(() => {
      chart = nv.models.multiChart().margin({top: 30, right: 90, bottom: 60, left: 75}).options({
        duration: 300,
        tooltips: true,

        useInteractiveGuideline: true,
      });

      // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the
      // parent chart, so need to chain separately
      chart.xAxis.axisLabel(i18n.MSG_GRAPH_TIME_AXIS_LABEL)
          .tickFormat((d) => d3.time.format('%H:%M')(new Date(d)))
          .staggerLabels(true);
      chart.yAxis1.axisLabel(i18n.MSG_GRAPH_CPU_USAGE_AXIS_LABEL).tickFormat(formatCpuUsage);

      chart.yAxis2.axisLabel(i18n.MSG_GRAPH_MEMORY_USAGE_LEGEND_LABEL)
          .tickFormat(formatMemoryUsage);

      chart.interactiveLayer.tooltip.valueFormatter(function(d, i) {
        return i === 0 ? chart.yAxis1.tickFormat()(d) : chart.yAxis2.tickFormat()(d);
      });

      // bind data to the graph.
      data = [
        {
          area: true,
          values: parsedGraphData['cpu/usage_rate'],
          key: i18n.MSG_GRAPH_CPU_USAGE_LEGEND_LABEL,
          color: '#00c752',  // $chart-1
          fillOpacity: 0.2,
          strokeWidth: 3,
          type: 'line',
          yAxis: 1,
        },
        {
          area: true,
          values: parsedGraphData['memory/usage'],
          key: i18n.MSG_GRAPH_MEMORY_USAGE_LEGEND_LABEL,
          color: '#326de6',  // $chart-2
          fillOpacity: 0.2,
          strokeWidth: 3,
          type: 'line',
          yAxis: 2,
        },
      ];

      let graphArea = d3.select(this.element_[0]);
      let svg = graphArea.append('svg');

      svg.attr('height', '300px').datum(data).call(chart);
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
          () => setTimeout(
              chart.update, 500),  // listener, call after 500ms after animation is complete.
          true                     // deep watch
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

const i18n = {
  /** @export {string} @desc Name of the CPU usage metric as displayed in the legend. */
  MSG_GRAPH_CPU_USAGE_LEGEND_LABEL: goog.getMsg('CPU Usage'),
  /** @export {string} @desc Name of the memory usage metric as displayed in the legend. */
  MSG_GRAPH_MEMORY_USAGE_LEGEND_LABEL: goog.getMsg('Memory Usage'),
  /** @export {string} @desc Name of Y axis showing CPU usage. */
  MSG_GRAPH_CPU_USAGE_AXIS_LABEL: goog.getMsg('CPU Usage (cores)'),
  /** @export {string} @desc Name of Y axis showing memory usage. */
  MSG_GRAPH_MEMORY_USAGE_AXIS_LABEL: goog.getMsg('Memory Usage (bytes)'),
  /** @export {string} @desc Name of time axis. */
  MSG_GRAPH_TIME_AXIS_LABEL: goog.getMsg('Time'),
};
