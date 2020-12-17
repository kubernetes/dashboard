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
import {ViewportMetadata} from '@api/frontendapi';
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
  yScaleMax = 0;

  private suffixMap_: Map<number, string> = new Map<number, string>();
  private yAxisSuffix_ = '';
  private visible_ = false;

  ngOnInit(): void {
    if (!this.graphType) {
      throw new Error('Graph type has to be provided.');
    }

    this.series = this.generateSeries_();
    this.customColors = this.getColor_();
    this.yAxisLabel = this.graphType === GraphType.CPU ? 'CPU (cores)' : 'Memory (bytes)';
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.visible_) {
      this.suffixMap_.clear();
      this.series = this.generateSeries_();
    }
  }

  changeState(isInViewPort: ViewportMetadata): void {
    this.visible_ = isInViewPort.visible;
  }

  getTooltipValue(value: number): string {
    return `${value} ${this.suffixMap_.has(value) ? this.suffixMap_.get(value) : ''}`;
  }

  private generateSeries_(): Array<{name: string; series: Array<{value: number; name: string}>}> {
    const points: DataPoint[] = [];
    let series: FormattedValue[];
    let highestSuffixPower = 0;
    let highestSuffix = '';
    let maxValue = 0;

    switch (this.graphType) {
      case GraphType.Memory:
        series = this.metric.dataPoints.map(point => FormattedValue.NewFormattedMemoryValue(point.y));
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

    const result = [
      {
        name: this.id,
        series: points.reduce(this._average.bind(this), []).map(point => {
          if (maxValue < point.y) {
            maxValue = point.y;
          }

          return {
            value: point.y,
            name: timeFormat('%H:%M')(new Date(1000 * point.x)),
          };
        }),
      },
    ];

    // This way if max value is very small i.e. 0.0001 graph will be scaled to the more significant
    // value.
    switch (this.graphType) {
      case GraphType.CPU:
        this.yScaleMax = maxValue + 0.01;
        break;
      case GraphType.Memory:
        this.yScaleMax = maxValue + 10;
        break;
      default:
    }

    return result;
  }

  // Calculate the average usage based on minute intervals. If there are more data points within
  // a single minute, they will be accumulated and an average will be taken.
  private _average(acc: DataPoint[], point: DataPoint, idx: number, points: DataPoint[]): DataPoint[] {
    if (idx > 0) {
      const currMinute = this._getMinute(point.x);
      const lastMinute = this._getMinute(points[idx - 1].x);

      // Minute changed or we are at the end of an array
      if (currMinute !== lastMinute || idx === points.length - 1) {
        let i = idx - 2;
        // Initialize with last minute
        const minutes = [points[idx - 1].y];

        // Track back all remaining points for the last minute
        while (i >= 0 && lastMinute === this._getMinute(points[i].x)) {
          minutes.push(points[i].y);
          i--;
        }

        // Calculate an average of this minute values
        const average = minutes.reduce((a, b) => a + b, 0) / minutes.length;

        // Accumulate the result
        return acc.concat({
          x: points[idx - 1].x,
          y: Number(average.toPrecision(3)),
        });
      }
    }

    return acc;
  }

  private _getMinute(date: number): number {
    return new Date(1000 * date).getMinutes();
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
