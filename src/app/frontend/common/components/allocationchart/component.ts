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

import {Component, Input, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {Selection} from 'd3';
import * as nv from 'nvd3';
import {Nvd3Element} from 'nvd3';

interface PieChart {
  data: PieChartData;
}

interface PieChartData {
  value: number;
}

@Component({
  selector: 'kd-allocation-chart',
  templateUrl: './template.html',
})
export class AllocationChartComponent implements OnInit {
  @Input() data: PieChartData[];
  @Input() colorPalette: string[];
  @Input() outerPercent: number;
  @Input() outerColor: string;
  @Input() innerPercent: number;
  @Input() innerColor: string;
  @Input() ratio = 0.67;
  @Input() enableTooltips = false;
  @Input() size: number;
  @Input() id: string;

  ngOnInit(): void {
    this.generateGraph_();
  }

  /**
   * Initializes pie chart graph. Check documentation at:
   * https://nvd3-community.github.io/nvd3/examples/documentation.html#pieChart
   */
  initPieChart_(
      svg: Selection<{}>, data: PieChartData[], colors: string[], margin: number, ratio: number,
      labelFunc: (d: {}, i: number, values: {}) => string | null): Nvd3Element {
    const size = this.size || 280;

    if (!labelFunc) {
      labelFunc = this.formatLabel_;
    }

    const chart = nv.models.pieChart()
                      .showLegend(false)
                      .showLabels(true)
                      .x(d => d.key)
                      .y(d => d.value)
                      .donut(true)
                      .donutRatio(ratio)
                      .color(colors)
                      .margin({top: margin, right: margin, bottom: margin, left: margin})
                      .width(size)
                      .height(size)
                      .growOnHover(false)
                      .labelType(labelFunc);

    chart.tooltip.enabled(this.enableTooltips);
    chart.tooltip.contentGenerator(obj => {
      /**
       * This is required because the RatioItem.key is of the form `label: count` and the
       * RatioItem.value stores the percentage. This splits the key to extract label and
       * the count.
       */
      if (obj.data.key.includes(':')) {
        const values = obj.data.key.split(':');
        return `<h3>${values[0]}</h3><p>${values[1]}</p>`;
      }
      return obj.data.key;
    });

    svg.attr('height', size)
        .attr('width', size)
        .append('g')
        .datum(data)
        .transition()
        .duration(350)
        .call(chart);

    return chart;
  }

  /**
   * Generates graph using provided requests and limits bindings.
   */
  generateGraph_(): void {
    nv.addGraph(() => {
      const svg = d3.select(`#${this.id}`).append('svg');
      if (!this.data) {
        let chart: Nvd3Element;
        if (this.outerPercent !== undefined) {
          this.outerColor = this.outerColor ? this.outerColor : '#00c752';
          chart = this.initPieChart_(
              svg, [{value: this.outerPercent}, {value: 100 - this.outerPercent}],
              [this.outerColor, '#ddd'], 0, 0.67, this.displayOnlyAllocated_);
        }
        if (this.innerPercent !== undefined) {
          this.innerColor = this.innerColor ? this.innerColor : '#326de6';
          chart = this.initPieChart_(
              svg, [{value: this.innerPercent}, {value: 100 - this.innerPercent}],
              [this.innerColor, '#ddd'], 39, 0.55, this.displayOnlyAllocated_);
        }
        return chart;
      } else {
        // Initializes a pie chart with multiple entries in a single ring
        return this.initPieChart_(svg, this.data, this.colorPalette, 0, this.ratio, null);
      }
    });
  }

  /**
   * Displays label only for allocated resources (with index equal to 0).
   */
  private displayOnlyAllocated_(d: PieChart, i: number): string {
    if (i === 0) {
      return `${Math.round(d.data.value)}%`;
    }
    return '';
  }

  /**
   * Formats percentage label to display in fixed format.
   */
  private formatLabel_(d: PieChart): string {
    return `${Math.round(d.data.value)}%`;
  }
}
