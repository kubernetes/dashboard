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
  }

  $onInit() {
      this.generateGraph();
  }

  // https://nvd3-community.github.io/nvd3/examples/documentation.html#pieChart
  initPieChart(size, margin, ratio) {
      let chart = nv.models.pieChart()
          .showLegend(false)
          .showLabels(true)
          .x(function (d) {return d.label;})
          .y(function (d) {return d.value;})
          .donut(true)
          .donutRatio(ratio)
          .color(['#326de6', '#fff'])
          .margin({top: margin, right: margin, bottom: margin, left: margin})
          .width(size)
          .height(size)
          .growOnHover(false)
          .labelType(function(d, i){

            // Displays label only for allocated resources, free will be white on white without label - invisible.
            if(i === 0) {
              return d.data.value;
            }
            return "";
          });

      chart.tooltip.enabled(false);
      return chart;
  }


  /**
   * Generates graph using this.metrics provided.
   * @private
   */
  generateGraph() {
    let chart;
    let chart2;
    let size = 320;

    var dataset = [
      {label:'Usage', value:4},
      {label:'Free', value:8},
    ];

    var dataset2 = [
      {label:'Usage', value:70},
      {label:'Free', value:30},
    ];


    nv.addGraph(() => {
      chart = this.initPieChart(size, 0, 0.65);
      chart2 = this.initPieChart(size, 36, 0.6);
      chart2.title('CPU Usage');

      let graphArea = d3.select(this.element_[0]);
      let svg = graphArea.append('svg');

      svg.attr("height", size).attr("width", size).append("g").datum(dataset).transition().duration(350).call(chart);
      svg.attr("height", size).attr("width", size).append("g").datum(dataset2).transition().duration(350).call(chart2);

      nv.utils.windowResize(chart.update);
      this.scope_.$watch(() => graphArea.node().getBoundingClientRect().width, false);
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
  controller: GraphController,
  templateUrl: 'node/detail/graph.html',
};
