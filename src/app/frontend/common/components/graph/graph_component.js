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
import {getNewMax, getTickValues} from './tick_values';
import {getCustormTooltipGenerator} from "./tooltip_generator";

let eventMarkerHeight = 20;
let eventMarkerWidth = 3;

function getEventsBetweenTimes(events, startTime, endTime) {
  if (!events) {
    return [];
  }
  return events.filter((event) => {
    let lastSeen = new Date(event.lastSeen);
    return startTime <= lastSeen && lastSeen < endTime })
}

function getEventsByDataPointIndex(dataPoints, events) {
  let eventsByDataPointIndex = {};
  for (let i = 0; i < dataPoints.length; i++) {
    let eventsUntilTime = i+1 === dataPoints.length ? new Date() : 1000*dataPoints[i + 1].x;
    eventsByDataPointIndex[i] = getEventsBetweenTimes(events, 1000*dataPoints[i].x, eventsUntilTime);
  }
  return eventsByDataPointIndex;
}

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

    /**
     * List of events. Initialized from the scope.
     * @export {!Array<!backendApi.Event>}
     */
    this.events;
    console.log(this.events);

    /**
     * List of events that were selected by the user by clicking on some data point on the graph.
     * @export {!Array<!backendApi.Event>}
     */
    this.selectedEvents= [];
  }

  $onInit() {
    // draw graph if data is available
    if (this.metrics !== null && this.metrics.length !== 0) {
      this.generateGraph();
    }
  }

  /**
   * Generates graph using this.metrics provided.
   * @private
   */
  generateGraph() {
    let chart;

    nv.addGraph(() => {
      // basic chart options - multiChart with interactive tooltip
      chart = nv.models.multiChart().margin({top: 30, right: 30, bottom: 55, left: 75}).options({
        duration: 300,
        tooltips: true,
        useInteractiveGuideline: true,
      });
      let data = [];
      let eventsByDataPointIndex = {};
      let yAxis1Type;
      let yAxis2Type;
      let y1max = 1;
      let y2max = 1;
      // iterate over metrics and add them to graph display
      for (let i = 0; i < this.metrics.length; i++) {
        let metric = this.metrics[i];
        // don't display metric if the number of its number of data points is smaller than 2
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

      // don't display empty graph, hide it completely,
      if (data.length === 0) {
        return;
      } else {
        eventsByDataPointIndex = getEventsByDataPointIndex(data[0].values, this.events);
      }

      if (typeof yAxis1Type === 'undefined') {
        // If Y axis 2 is used, but not axis 1, move all graphs from axis 2 to axis 1 (left one). Looks much
        // better.
        yAxis1Type = yAxis2Type;
        y1max = y2max;
        data.forEach((d) => d.yAxis = 1);
        yAxis2Type = undefined;
      }

      // Hide legend when displaying only one 1 line.
      if (data.length === 1) {
        chart.showLegend(false);
      }

      // customise X axis (hardcoded time).
      let xAxisSettings = axisSettings[TimeAxisType];
      chart.xAxis.axisLabel(xAxisSettings.label)
          .tickFormat(xAxisSettings.formatter)
          .staggerLabels(false);

      // customise Y axes
      if (typeof yAxis1Type !== 'undefined') {
        let yAxis1Settings = axisSettings[yAxis1Type];
        chart.yAxis1.axisLabel(yAxis1Settings.label)
            .tickFormat(yAxis1Settings.formatter)
            .tickValues(getTickValues(y1max));
        chart.yDomain1([0, getNewMax(y1max)]);
      }
      if (typeof yAxis2Type !== 'undefined') {
        let yAxis2Settings = axisSettings[yAxis2Type];
        chart.yAxis2.axisLabel(yAxis2Settings.label)
            .tickFormat(yAxis2Settings.formatter)
            .tickValues(getTickValues(y2max));
        chart.yDomain2([0, getNewMax(y2max)]);
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

      // display custom tooltip
      chart.interactiveLayer.tooltip.contentGenerator(getCustormTooltipGenerator(chart, eventsByDataPointIndex));

      // generate graph
      let graphArea = d3.select(this.element_[0]);
      let svg = graphArea.insert('svg', ":first-child");

      svg.attr('height', '200px').datum(data).call(chart);

      // change background color to white
      svg.style({
        'background-color': 'white',
      });

      let markAllEvents = () => {
        // I spent ages to figure out this function... Hard to believe.
        // Hints for future developers:
        // 1. Learn d3!
        // 2. In order to add extra features to the graph just add extra routines newChartUpdate function defined below.
        // 3. Use selection.transition() for smooth graph update
        // 4. Don't remove/add elements on update unless you have to. Instead create elements and modify their opacity/position. Doing so prevents
        //    graph from flickering.
        // 5. Read nvd3 source code - especially following models: line, scatter, tooltip, axes and of course multiChart.
        // 6. To convert values to coords on graph use chart.lines1.scatter.xScale()(xValueToConvert). Same for x and axis 2. See example below.
        // 7. Use nv-series to choose colors and styles specific for certain data series.

        // This function basically adds event markers to all data points and updates their position.
        // Only data points that have events should have markers so the opacity of data points without events is set to 0.
        //
        let markerGroup = svg.select('.nv-scatter').selectAll('g.event-marker-group').data([0]).enter().append('g').attr('class', 'event-marker-group');
        for (let seriesId in data) {
           let isDisabled = !!data[seriesId].disabled;
           let xConv = (data[seriesId].yAxis==1?chart.lines1:chart.lines2).scatter.xScale();
           let yConv = (data[seriesId].yAxis==1?chart.lines1:chart.lines2).scatter.yScale();
           let markerSeriesGroup = markerGroup.selectAll(`g.marker-series-${seriesId}`).data([0]).enter().append('g').attr('class', `marker-series-${seriesId}`);
          // it does not have to be a red rectangle, you can use any other shape
           markerSeriesGroup.selectAll('rect').data(data[seriesId].values).enter().append('rect')
               .attr('x', -eventMarkerWidth / 2)
               .attr('y', -eventMarkerHeight / 2)
               .attr('width', eventMarkerWidth)
               .attr('height', eventMarkerHeight)
               .attr('class', (d, i) => `event-marker-${i}`)
               .attr('stroke-width', 0)
               .attr('fill', 'red')
               .attr('transform',  (d) => `translate(${xConv(d.x)}, ${yConv(d.y)})`)
               .on('click', (d,i) => {
                 this.selectedEvents = eventsByDataPointIndex[i];
                 this.scope_.$digest();
               });
           svg.select(`g.marker-series-${seriesId}`).selectAll('rect').transition()
               .attr('transform',  (d) => `translate(${xConv(d.x)}, ${yConv(d.y)})`)
               .attr('fill-opacity', (d, i) => isDisabled || eventsByDataPointIndex[i].length===0 ? 0: 1);
        }
      }

      let oldChartUpdate = chart.update;

      let newChartUpdate = function () {
        oldChartUpdate();
        // here add all extra graph drawing functions
        markAllEvents();
      };


      let isUpdatingFunctionRunning = false;
      let updateUntil = 0;

      /**
       * Calls chart.update for a period of updatePeriod ms. Delay between calls =
       * timeBetweenUpdates ms.
       * @param {number} updatePeriod
       * @param {number} timeBetweenUpdates
       */
      let startChartUpdatePeriod = function(updatePeriod, timeBetweenUpdates) {
        if (isUpdatingFunctionRunning) {
          // Don't start another updater oif updating funciton is already running
          // just the prolong running time of currently running function to required value.
          updateUntil = new Date().valueOf() + updatePeriod;
          return;
        }
        isUpdatingFunctionRunning = true;
        updateUntil = new Date().valueOf() + updatePeriod;
        // update chart and call itself again if still in update period.
        let updater = function() {
          setTimeout(() => {
            newChartUpdate()
          })
          chart.update();
          if (new Date() < updateUntil) {
            setTimeout(updater, timeBetweenUpdates);
          } else {
            isUpdatingFunctionRunning = false;
          }
        };
        setTimeout(updater, timeBetweenUpdates);
      };

      // update the graph in case of graph area resize
      nv.utils.windowResize(newChartUpdate);
      this.scope_.$watch(
          () => graphArea.node().getBoundingClientRect().width,  // variable to watch
          () => startChartUpdatePeriod(1600, 200),
          false  // not a deep watch
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
    'events': '<',
  },
  controller: GraphController,
  templateUrl: 'common/components/graph/graph.html',
};
