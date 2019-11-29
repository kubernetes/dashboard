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

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Metric} from '@api/backendapi';
import {curveBasis, CurveFactory, timeFormat} from 'd3';

import {compareCoreSuffix, compareMemorySuffix, coresFilter, memoryFilter} from './helper';

export enum GraphType {
  CPU = 'cpu',
  Memory = 'memory',
}

@Component({selector: 'kd-graph', templateUrl: './template.html'})
export class GraphComponent implements OnInit, OnChanges {
  @Input() metric: Metric;
  @Input() id: string;
  @Input() graphType: GraphType = GraphType.CPU;

  series: Array<{name: string; series: Array<{value: number; name: string}>}> = [];
  curve = curveBasis;
  customColors = {};
  yAxisLabel = '';
  yAxisTickFormatting = (value: number) => `${value} ${this.yAxisSuffix_}`;

  private suffixMap_: Map<number, string> = new Map<number, string>();
  private yAxisSuffix_ = '';

  ngOnInit(): void {
    if (!this.graphType) {
      throw new Error('Graph type has to be provided.');
    }

    this.series = this.generateSeries_();
    this.customColors = this.getColor_();
    this.yAxisLabel = this.graphType === GraphType.CPU ? 'CPU (cores)' : 'Memory (bytes)';
  }

  ngOnChanges(_: SimpleChanges): void {
    this.suffixMap_.clear();
    this.series = this.generateSeries_();
  }

  getTooltipValue(value: number): string {
    return `${value} ${this.suffixMap_.has(value) ? this.suffixMap_.get(value) : ''}`;
  }

  private generateSeries_(): Array<{name: string; series: Array<{value: number; name: string}>}> {
    return [
      {
        name: this.id,
        series: this.metric.dataPoints.map(point => {
          return {
            value: this.normalize_(point.y),
            name: timeFormat('%H:%M')(new Date(1000 * point.x)),
          };
        }),
      },
    ];
  }

  private getColor_(): Array<{name: string; value: string}> {
    return this.graphType === GraphType.CPU
      ? [
          {
            name: this.id,
            value: '#00c752',
          },
        ]
      : [
          {
            name: this.id,
            value: '#326de6',
          },
        ];
  }

  private normalize_(data: number): number {
    const filtered = this.graphType === GraphType.CPU ? coresFilter(data) : memoryFilter(data);
    const parts = filtered.split(' ');
    const value = Number(parts[0]);

    if (parts.length > 1) {
      this.suffixMap_.set(value, parts[1]);

      switch (this.graphType) {
        case GraphType.CPU:
          this.yAxisSuffix_ =
            compareCoreSuffix(this.yAxisSuffix_, parts[1]) === -1 ? parts[1] : this.yAxisSuffix_;
          break;
        case GraphType.Memory:
          this.yAxisSuffix_ =
            compareMemorySuffix(this.yAxisSuffix_, parts[1]) === -1 ? parts[1] : this.yAxisSuffix_;
          break;
        default:
          this.yAxisSuffix_ = '';
      }
    }

    return value;
  }
}
