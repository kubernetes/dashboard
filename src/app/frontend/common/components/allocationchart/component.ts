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

import {Component, Input, OnInit} from "@angular/core";
import * as nv from "nvd3";
import * as d3 from "d3";
import {Nvd3Element} from "nvd3";

@Component({
  selector: 'kd-allocation-chart',
  templateUrl: './template.html',
})
export class AllocationChartComponent implements OnInit {
  @Input() data: any[];
  @Input() colorPalette: string[];
  @Input() outerPercent: number;
  @Input() outerColor: string;
  @Input() innerPercent: number;
  @Input() innerColor: string;
  @Input() ratio = 0.67;
  @Input() enableTooltips = false;
  @Input() size: number;

  ngOnInit(): void {
    this.generateGraph_();
  }

  /**
   * Initializes pie chart graph. Check documentation at:
   * https://nvd3-community.github.io/nvd3/examples/documentation.html#pieChart
   */
  initPieChart_(svg: any, data: any[], colors: string[], margin: number, ratio: number, labelFunc: (d: any, i: number, values: any) => string | null): any {
    let size = this.size || 280;

    if (!labelFunc) {
      labelFunc = this.formatLabel_;
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

    chart.tooltip.enabled(this.enableTooltips);
    chart.tooltip.contentGenerator((obj) => {
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
      let svg = d3.select("#chart-container svg");
      if (!this.data) {
        let chart: Nvd3Element;
        if (this.outerPercent !== undefined) {
          this.outerColor = this.outerColor ? this.outerColor : '#00c752';
          chart = this.initPieChart_(
            svg,
            [{value: this.outerPercent}, {value: 100 - this.outerPercent}],
            [this.outerColor, '#ddd'], 0, 0.67, this.displayOnlyAllocated_);
        }
        if (this.innerPercent !== undefined) {
          this.innerColor = this.innerColor ? this.innerColor : '#326de6';
          chart =  this.initPieChart_(
            svg,
            [{value: this.innerPercent}, {value: 100 - this.innerPercent}],
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
  private displayOnlyAllocated_(d: any, i: number): string {
    if (i === 0) {
      return `${Math.round(d.data.value)}%`;
    }
    return '';
  }

  /**
   * Formats percentage label to display in fixed format.
   */
  private formatLabel_(d: any): string {
    return `${Math.round(d.data.value)}%`;
  }
}
