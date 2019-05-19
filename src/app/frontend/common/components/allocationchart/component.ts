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

interface PieChartData {
  key?: string;
  value: number;
  color?: string;
}

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
  @Input() ratio = 0.67;
  @Input() enableTooltips = false;
  @Input() size: number;
  @Input() id: string;

  ngAfterViewInit(): void {
    setTimeout(() => this.generateGraph_(), 0);
  }

  initPieChart_(
    data: PieChartData[],
    padding: number,
    ratio: number,
    labelFunc: (d: {}, i: number, values: {}) => string | null
  ): ChartAPI {
    const size = this.size || 280;

    if (!labelFunc) {
      labelFunc = this.formatLabel_;
    }

    const colors: { [key: string]: string } = {};
    const columns: Array<Array<string | number>> = [];

    data.forEach((x, i) => {
      if (x.value > 0) {
        colors[x.key || x.value] = x.color || this.colorPalette[i];
        columns.push([x.key || x.value, x.value]);
      }
    });

    return generate({
      bindto: `#${this.id}`,
      size: {
        width: size,
        height: size,
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: this.enableTooltips,
      },
      transition: { duration: 350 },
      donut: {
        width: size * (1 - ratio),
        label: {
          format: labelFunc,
        },
      },
      data: {
        columns,
        type: 'donut',
        colors,
      },
      padding: { top: padding, right: padding, bottom: padding, left: padding },
    });
  }

  /**
   * Generates graph using provided requests and limits bindings.
   */
  generateGraph_(): void {
    if (!this.data) {
      if (this.outerPercent !== undefined) {
        this.outerColor = this.outerColor ? this.outerColor : '#00c752';
        this.initPieChart_(
          [
            { value: this.outerPercent, color: this.outerColor },
            { value: 100 - this.outerPercent, color: '#ddd' },
          ],
          0,
          0.67,
          this.displayOnlyAllocated_
        );
      }

      if (this.innerPercent !== undefined) {
        this.innerColor = this.innerColor ? this.innerColor : '#326de6';
        this.initPieChart_(
          [
            { value: this.innerPercent, color: this.innerColor },
            { value: 100 - this.innerPercent, color: '#ddd' },
          ],
          39,
          0.55,
          this.displayOnlyAllocated_
        );
      }
    } else {
      // Initializes a pie chart with multiple entries in a single ring
      this.initPieChart_(this.data, 0, this.ratio, null);
    }
  }

  /**
   * Displays label only for allocated resources
   */
  private displayOnlyAllocated_(value: number): string {
    return `${Math.round(value)}%`;
  }

  /**
   * Formats percentage label to display in fixed format.
   */
  private formatLabel_(value: number): string {
    return `${Math.round(value)}%`;
  }
}
