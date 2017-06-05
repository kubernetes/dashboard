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

    /** {number} Outer graph percent. **/
    this.outer;

    /** {number} Inner graph percent. **/
    this.inner;

    /** {string} Graph title. **/
    this.title;
  }

  $onInit() {
    this.outerData = [
      {value: this.outer},
      {value: 100 - this.outer},
    ];

    this.innerData = [
      {value: this.inner},
      {value: 100 - this.inner},
    ];

    this.generateGraph_();
  }

  /**
   * Initializes pie chart graph. Check documentation at:
   * https://nvd3-community.github.io/nvd3/examples/documentation.html#pieChart
   *
   * @private
   */
  initPieChart_(svg, data, color, margin, ratio) {
    let size = 280;
    let chart = nv.models.pieChart()
                    .showLegend(false)
                    .showLabels(true)
                    .x((d) => {
                      return d.value;
                    })
                    .y((d) => {
                      return d.value;
                    })
                    .donut(true)
                    .donutRatio(ratio)
                    .color([color, '#ddd'])
                    .margin({top: margin, right: margin, bottom: margin, left: margin})
                    .width(size)
                    .height(size)
                    .growOnHover(false)
                    .labelType((d, i) => {
                      // Displays label only for allocated resources.
                      if (i === 0) {
                        return `${d.data.value.toFixed(2)}%`;
                      }
                      return '';
                    });

    chart.tooltip.enabled(false);

    svg.attr('height', size)
        .attr('width', size)
        .append('g')
        .datum(data)
        .transition()
        .duration(350)
        .call(chart);
  }


  /**
   * Generates graph using provided requests and limits bindings.
   * @private
   */
  generateGraph_() {
    nv.addGraph(() => {
      let svg = d3.select(this.element_[0]).append('svg');

      if (this.outer !== undefined) {
        this.initPieChart_(svg, this.outerData, '#00c752', 0, 0.61);
      }

      if (this.inner !== undefined) {
        this.initPieChart_(svg, this.innerData, '#326de6', 36, 0.55);
      }
    });
  }
}

/**
 * Definition object for the component that displays graph with CPU and Memory usage metrics.
 *
 * @type {!angular.Component}
 */
export const graphComponent = {
  restrict: 'E',
  transclude: true,
  bindings: {
    'outer': '<',
    'inner': '<',
    'title': '<',
  },
  controller: GraphController,
  templateUrl: 'node/detail/graph.html',
};
