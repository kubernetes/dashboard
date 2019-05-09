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

import { Component, Input, AfterViewInit, OnInit } from '@angular/core';
import { Metric } from '@api/backendapi';
import { generate } from 'c3';
import { select } from 'd3-selection';
import { coresFilter, memoryFilter } from './helper';
import { timeFormat } from 'd3';

@Component({ selector: 'kd-graph', templateUrl: './template.html' })
export class GraphComponent implements OnInit, AfterViewInit {
  @Input() metric: Metric;
  @Input() id: string;
  private name: string;

  ngOnInit(): void {
    if (this.id) {
      this.name = this.id;
      this.id = this.id.replace(/\s/g, '');
    }
  }

  ngAfterViewInit(): void {
    if (this.metric && this.id) {
      this.generateGraph();
    }
  }

  private generateGraph() {
    generate({
      bindto: select(`#${this.id}`),
      size: {
        height: 200,
      },
      padding: {
        right: 25,
      },
      data: {
        x: 'x',
        columns: [
          ['x', ...this.metric.dataPoints.map(dp => dp.x)],
          [this.name, ...this.metric.dataPoints.map(dp => dp.y)],
        ],
        types: {
          'CPU Usage': 'area-spline',
          'Memory Usage': 'area-spline',
        },
        colors: {
          'CPU Usage': '#00c752',
          'Memory Usage': '#326de6',
        },
      },
      axis: {
        x: {
          tick: {
            format: (x: number): string => {
              return timeFormat('%H:%M')(new Date(1000 * x));
            },
          },
          label: 'Time',
        },
        y: {
          tick: {
            format: this.name.includes('CPU') ? coresFilter : memoryFilter,
          },
          label: this.name.includes('CPU') ? 'CPU (Cores)' : 'Memory (bytes)',
        },
      },
    });
  }
}
