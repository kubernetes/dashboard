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

import { AfterViewInit, Component, Input } from '@angular/core';
import { generate, ChartAPI } from 'c3';
import { BaseType, select, Selection } from 'd3';

interface PieChartData {
  key?: string;
  value: number;
  color?: string;
}

type ChartType = 'pie' | 'donut';

@Component({
  selector: 'kd-allocation-chart',
  templateUrl: './template.html',
})
export class AllocationChartComponent implements AfterViewInit {
  @Input() data: PieChartData[];
  @Input() colorPalette: string[];
  @Input() outerPercent: number;
  @Input() outerColor: string;
  @Input() innerPercent: number;
  @Input() innerColor: string;
  @Input() type: ChartType = 'donut';
  @Input() enableTooltips = false;
  @Input() size = 280;
  @Input() id: string;

  allocated = new Set();

  ngAfterViewInit(): void {
    setTimeout(() => this.generateGraph_(), 0);
  }

  initPieChart_(
    svg: Selection<BaseType, {}, HTMLElement, HTMLElement>,
    data: PieChartData[],
    padding: number,
    labelFunc: (d: {}, i: number, values: {}) => string | null = this
      .formatLabel_
  ): ChartAPI {
    const colors: { [key: string]: string } = {};
    const columns: Array<Array<string | number>> = [];

    data.forEach((x, i) => {
      if (x.value > 0) {
        const key = x.key || x.value;
        colors[key] = x.color || this.colorPalette[i];
        columns.push([key, x.value]);

        if (i === 0) {
          this.allocated.add(key);
        }
      }
    });

    return generate({
      bindto: svg,
      size: {
        width: this.size,
        height: this.size,
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: this.enableTooltips,
      },
      transition: { duration: 350 },
      donut: {
        label: {
          format: labelFunc,
        },
      },
      data: {
        columns,
        type: this.type,
        colors,
      },
      padding: { top: padding, right: padding, bottom: padding, left: padding },
    });
  }

  /**
   * Generates graph using provided requests and limits bindings.
   */
  generateGraph_(): void {
    let svg = select(`#${this.id}`);

    if (!this.data) {
      svg = svg
        .append('svg')
        .attr('width', this.size)
        .attr('height', this.size);

      if (this.outerPercent !== undefined) {
        this.outerColor = this.outerColor ? this.outerColor : '#00c752';
        this.initPieChart_(
          svg.append('g'),
          [
            { value: this.outerPercent, color: this.outerColor },
            { value: 100 - this.outerPercent, color: '#ddd' },
          ],
          0,
          this.displayOnlyAllocated_.bind(this)
        );
      }

      if (this.innerPercent !== undefined) {
        this.innerColor = this.innerColor ? this.innerColor : '#326de6';
        this.initPieChart_(
          svg.append('g'),
          [
            { value: this.innerPercent, color: this.innerColor },
            { value: 100 - this.innerPercent, color: '#ddd' },
          ],
          45,
          this.displayOnlyAllocated_.bind(this)
        );
      }
    } else {
      // Initializes a pie chart with multiple entries in a single ring
      this.initPieChart_(svg, this.data, 0);
    }
  }

  /**
   * Displays label only for allocated resources
   */
  private displayOnlyAllocated_(
    value: number,
    _: number,
    id: string | number
  ): string {
    if (this.allocated.has(id)) {
      return `${Math.round(value)}%`;
    }
    return '';
  }

  /**
   * Formats percentage label to display in fixed format.
   */
  private formatLabel_(value: number): string {
    return `${Math.round(value)}%`;
  }
}
