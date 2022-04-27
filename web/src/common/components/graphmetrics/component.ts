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

import {Component, Input} from '@angular/core';
import {Metric} from '@api/root.api';
import {GraphType} from '../graph/component';

@Component({
  selector: 'kd-graph-metrics',
  templateUrl: './template.html',
})
export class GraphMetricsComponent {
  @Input() metrics: Metric[];

  readonly GraphType: typeof GraphType = GraphType;

  showGraphs(): boolean {
    return this.metrics && this.metrics.every(metrics => metrics.dataPoints && metrics.dataPoints.length > 1);
  }
}
