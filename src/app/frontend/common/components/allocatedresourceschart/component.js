// Copyright 2017 The Kubernetes Dashboard Authors.
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

export class AllocatedResourcesChartController {
  /**
   * @ngInject
   * @param {!angular.JQLite} $element
   */
  constructor($element) {
    /** @private {!angular.JQLite} */
    this.element_ = $element;

    /**
     * Data that fills a single pie chart
     * @export {Array<Object>}
     */
    this.data;

    /**
     * Colors for single ring pie chart
     * @export {!Array<string>}
     */
    this.colorPalette;

    /**
     * Outer graph percent. Initialized from the scope.
     * @export {number}
     */
    this.outer;

    /**
     * Outer graph color. Initialized from scope
     * @export {string}
     */
    this.outercolor;

    /**
     * Inner graph percent. Initialized from the scope.
     * @export {number}
     */
    this.inner;

    /**
     * Inner graph color. Initialized from scope
     * @export {string}
     */
    this.innercolor;
  }

  $onInit() {
    this.generateGraph_();
  }

  /**
   * Initializes pie chart graph. Check documentation at:
   * https://nvd3-community.github.io/nvd3/examples/documentation.html#pieChart
   *
   * @private
   */
  initPieChart_(svg, data, colors, margin, ratio, labelFunc) {
    let size = 280;

    if (!labelFunc) {
      labelFunc = (d) => {
        return `${d.data.value.toFixed(2)}%`;
      };
    }

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
                    .color(colors)
                    .margin({top: margin, right: margin, bottom: margin, left: margin})
                    .width(size)
                    .height(size)
                    .growOnHover(false)
                    .labelType(labelFunc);

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

      let displayOnlyAllocated = function(d, i) {
        // Displays label only for allocated resources.
        if (i === 0) {
          return `${d.data.value.toFixed(2)}%`;
        }
        return '';
      };

      if (!this.data) {
        if (this.outer !== undefined) {
          this.outercolor = this.outercolor ? this.outercolor : '#00c752';

          this.initPieChart_(
              svg,
              [
                {value: this.outer},
                {value: 100 - this.outer},
              ],
              [this.outercolor, '#ddd'], 0, 0.61, displayOnlyAllocated);
        }

        if (this.inner !== undefined) {
          this.innercolor = this.innercolor ? this.innercolor : '#326de6';
          this.initPieChart_(
              svg,
              [
                {value: this.inner},
                {value: 100 - this.inner},
              ],
              [this.innercolor, '#ddd'], 36, 0.55, displayOnlyAllocated);
        }
      } else {
        // Initializes a pie chart with multiple entries in a single ring
        this.initPieChart_(svg, this.data, this.colorPalette, 0, 0.61, null);
      }
    });
  }
}

/**
 * Definition object for the component that displays chart with allocated resources.
 *
 * @type {!angular.Component}
 */
export const allocatedResourcesChartComponent = {
  bindings: {
    'outer': '<',
    'outercolor': '<',
    'inner': '<',
    'innercolor': '<',
    'data': '<',
    'colorPalette': '<',
  },
  controller: AllocatedResourcesChartController,
  templateUrl: 'common/components/allocatedresourceschart/allocatedresourceschart.html',
};
