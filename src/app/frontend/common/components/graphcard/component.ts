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

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Metric} from '@api/root.api';
import {GraphType} from '../graph/component';

@Component({selector: 'kd-graph-card', templateUrl: './template.html'})
export class GraphCardComponent implements OnChanges {
  @Input() graphTitle: string;
  @Input() graphInfo: string;
  @Input() graphType: GraphType;
  @Input() metrics: Metric[];
  @Input() selectedMetricName: string;
  selectedMetric: Metric;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metrics']) {
      this.metrics = changes['metrics'].currentValue;
      this.selectedMetric = this.getSelectedMetrics();
    }
  }

  private getSelectedMetrics(): Metric {
    if (!this.selectedMetricName || (this.metrics.length && this.metrics[0].dataPoints.length === 0)) {
      return null;
    }

    return this.metrics && this.metrics.filter(metric => metric.metricName === this.selectedMetricName)[0];
  }

  shouldShowGraph(): boolean {
    return this.selectedMetric !== undefined;
  }
}
