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

import {Component} from '@angular/core';
import {Metric, PodList} from '@api/backendapi';
import {OnListChangeEvent, ResourcesRatio} from '@api/frontendapi';
import {Helper, ResourceRatioModes} from 'overview/helper';

import {ListIdentifier} from '../resourcelist/groupids';
import {emptyResourcesRatio} from '../workloadstatus/component';

@Component({selector: 'kd-graphs', templateUrl: './template.html'})
export class GraphsComponent {
  resourcesRatio: ResourcesRatio = emptyResourcesRatio;
  cumulativeMetrics: Metric[] = [];

  updateResourcesRatio(event: OnListChangeEvent) {
    switch (event.id) {
      case ListIdentifier.pod: {
        const pods = event.resourceList as PodList;
        this.resourcesRatio.podRatio = Helper.getResourceRatio(
            pods.status, pods.listMeta.totalItems, ResourceRatioModes.Completable);
        this.cumulativeMetrics = pods.cumulativeMetrics;
        break;
      }

      default:
        break;
    }
  }

  showGraphs(): boolean {
    return this.cumulativeMetrics.every(
        metrics => metrics.dataPoints && metrics.dataPoints.length > 1);
  }
}
