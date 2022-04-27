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

import {Directive, Input} from '@angular/core';
import {MetricResult} from '@api/root.api';

@Directive()
export class Sparkline {
  lastValue = 0;

  @Input() timeseries: MetricResult[];

  getPolygonPoints(): string {
    const series = this.timeseries.map(({timestamp, value}) => [Date.parse(timestamp), value]);
    const sorted = series.slice().sort((a, b) => a[0] - b[0]);
    this.lastValue = sorted.length > 0 ? sorted[sorted.length - 1][1] : undefined;
    const xShift = Math.min(...sorted.map(pt => pt[0]));
    const shifted = sorted.map(([x, y]) => [x - xShift, y]);
    const xScale = Math.max(...shifted.map(pt => pt[0])) || 1;
    const yScale = Math.max(...shifted.map(pt => pt[1])) || 1;
    const scaled = shifted.map(([x, y]) => [x / xScale, y / yScale]);

    // Invert Y because SVG Y=0 is at the top, and we want low values
    // of Y to be closer to the bottom of the graphic.
    const map = scaled.map(([x, y]) => `${x},${1 - y}`).join(' ');
    return `0,1 ${map} 1,1`;
  }
}
