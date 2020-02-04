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
import {DataPoint, Metric} from '@api/backendapi';
import {curveMonotoneX, timeFormat} from 'd3';

import {FormattedValue} from './helper';

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
  curve = curveMonotoneX;
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
    const points: DataPoint[] = [];
    let series: FormattedValue[];
    let highestSuffixPower = 0;
    let highestSuffix = '';

    switch (this.graphType) {
      case GraphType.Memory:
        series = this.metric.dataPoints.map(point =>
          FormattedValue.NewFormattedMemoryValue(point.y),
        );
        break;
      case GraphType.CPU:
        series = this.metric.dataPoints.map(point => FormattedValue.NewFormattedCoreValue(point.y));
        break;
      default:
        throw new Error(`Unsupported graph type ${this.graphType}.`);
    }

    // Find out the highest suffix
    series.forEach(value => {
      if (highestSuffixPower < value.suffixPower) {
        highestSuffixPower = value.suffixPower;
        highestSuffix = value.suffix;
      }
    });

    // Normalize all values to a single suffix
    series.map(value => {
      value.normalize(highestSuffix);
      return value;
    });

    this.yAxisSuffix_ = highestSuffix;

    this.metric.dataPoints.forEach((_, idx) => {
      points.push({
        x: this.metric.dataPoints[idx].x,
        y: series[idx].value,
      } as DataPoint);
    });

    return [
      {
        name: this.id,
        series: points.map(point => {
          return {
            value: point.y,
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
}
