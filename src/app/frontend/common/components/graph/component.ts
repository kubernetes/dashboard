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
import {DataPoint, Metric} from '@api/root.api';
import {ViewportMetadata} from '@api/root.ui';
import * as d3 from 'd3';

import {FormattedValue} from './helper';

export enum GraphType {
  CPU = 'cpu',
  Memory = 'memory',
}

enum TimeScale {
  Minutes,
  Hours,
  Days,
}

@Component({selector: 'kd-graph', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class GraphComponent implements OnInit, OnChanges {
  @Input() metric: Metric;
  @Input() id: string;
  @Input() graphType: GraphType = GraphType.CPU;

  series: Array<{name: string; series: Array<{value: number; name: string}>}> = [];
  curve = d3.curveMonotoneX;
  customColors = {};
  yAxisLabel = '';
  yScaleMax = 0;
  shouldShowGraph = false;

  private suffixMap_: Map<number, string> = new Map<number, string>();
  private yAxisSuffix_ = '';
  private visible_ = false;
  private minMetricsCount_ = 5;
  private maxMetricsCount_ = 15;
  private timeScale_ = TimeScale.Minutes;

  yAxisTickFormatting = (value: number) => `${value} ${this.yAxisSuffix_}`;

  ngOnInit(): void {
    if (!this.graphType) {
      throw new Error('Graph type has to be provided.');
    }

    this.series = this._generateSeries();
    this.customColors = this._getColor();
    this.yAxisLabel = this.graphType === GraphType.CPU ? 'CPU (cores)' : 'Memory (bytes)';
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.visible_) {
      this.suffixMap_.clear();
      this.series = this._generateSeries();
    }
  }

  changeState(isInViewPort: ViewportMetadata): void {
    this.visible_ = isInViewPort.visible;
  }

  getTooltipValue(value: number): string {
    return `${value} ${this.suffixMap_.has(value) ? this.suffixMap_.get(value) : ''}`;
  }

  private _generateSeries(): Array<{name: string; series: Array<{value: number; name: string}>}> {
    let points: DataPoint[] = [];
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
        throw new Error($localize`Unsupported graph type ${this.graphType}.`);
    }

    // Find out the highest suffix and normalize all values to a single suffix.
    // We have to loop twice to get the highest suffix (which could be later on)
    // and then normalise *all* values to that one suffix.
    series.forEach(value => {
      if (highestSuffixPower < value.suffixPower) {
        highestSuffixPower = value.suffixPower;
        highestSuffix = value.suffix;
      }
    });
    series.forEach(value => value.normalize(highestSuffix));

    this.yAxisSuffix_ = highestSuffix;

    this.metric.dataPoints.forEach((_, idx) => {
      points.push({
        x: this.metric.dataPoints[idx].x,
        y: series[idx].value,
      } as DataPoint);
    });

    this._findTimeScale(points);

    points = points.reduce(this._average.bind(this), []);
    this.shouldShowGraph = points.length >= this.minMetricsCount_;
    points = this._averageWithReduce(points, this.maxMetricsCount_);

    const result = [
      {
        name: this.id,
        series: points.map(point => {
          if (maxValue < point.y) {
            maxValue = point.y;
          }

          return {
            value: Number(point.y.toPrecision(3)),
            name: d3.timeFormat('%H:%M')(new Date(1000 * point.x)),
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
        this.yScaleMax = maxValue + 1;
        break;
      default:
    }

    return result;
  }

  // Calculate the average usage based on detected time unit intervals. If there are more data points than
  // max allowed metrics, they will be accumulated and an average will be taken.
  private _average(acc: DataPoint[], point: DataPoint, idx: number, points: DataPoint[]): DataPoint[] {
    if (idx > 0) {
      const currTimeUnit = this._getTimeScale(point.x);
      const lastTimeUnit = this._getTimeScale(points[idx - 1].x);

      // Time unit changed or we are at the end of an array
      if (currTimeUnit !== lastTimeUnit || idx === points.length - 1) {
        let i = idx - 2;
        // Initialize with last time unit
        const minutes = [points[idx - 1].y];

        // Track back all remaining points for the last time unit
        while (i >= 0 && lastTimeUnit === this._getTimeScale(points[i].x)) {
          minutes.push(points[i].y);
          i--;
        }

        // Calculate an average of this time unit values
        const average = minutes.reduce((a, b) => a + b, 0) / minutes.length;

        // Accumulate the result
        return acc.concat({
          x: points[idx - 1].x,
          y: average,
        });
      }
    }

    return acc;
  }

  // Average with reduce scales the number of provided points to the given limit.
  private _averageWithReduce(points: DataPoint[], limit: number): DataPoint[] {
    const result: DataPoint[] = [];
    const divider = Math.floor(points.length / limit);
    let reminder = points.length % limit;

    if (divider === 0 || (divider === 1 && reminder === 0)) {
      return points;
    }

    for (let i = 0; i < points.length; i += divider) {
      let sum = 0;
      let count = 0;

      for (let j = 0; j < divider && i + j < points.length; j++) {
        sum += points[i + j].y;
        count++;
      }

      if (reminder > 0) {
        sum += points[i + divider].y;
        i++;
        count++;
        reminder--;
      }

      result.push({
        x: points[i].x,
        y: sum / count,
      } as DataPoint);
    }

    return result;
  }

  private _getTimeScale(date: number): number {
    switch (this.timeScale_) {
      case TimeScale.Minutes:
        return this._getMinute(date);
      case TimeScale.Hours:
        return this._getHour(date);
      case TimeScale.Days:
        return this._getDay(date);
    }
  }

  private _getMinute(date: number): number {
    return new Date(1000 * date).getMinutes();
  }

  private _getHour(date: number): number {
    return new Date(1000 * date).getHours();
  }

  private _getDay(date: number): number {
    return new Date(1000 * date).getDay();
  }

  private _findTimeScale(points: DataPoint[]): void {
    if (points.length < 1) {
      return;
    }

    let metricsCount = 1;
    let lastTimeUnit = this._getTimeScale(points.pop().x);

    points.forEach(point => {
      const currTimeUnit = this._getTimeScale(point.x);
      if (lastTimeUnit !== currTimeUnit) {
        lastTimeUnit = currTimeUnit;
        metricsCount++;
      }
    });

    if (metricsCount <= this.minMetricsCount_ && this.timeScale_ > TimeScale.Minutes) {
      this.timeScale_--;
      return;
    }

    if (metricsCount > this.maxMetricsCount_ && this.timeScale_ < TimeScale.Days) {
      this.timeScale_++;
      this._findTimeScale(points);
    }
  }

  private _getColor(): Array<{name: string; value: string}> {
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
