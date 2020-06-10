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
import {
  CronJobList,
  DaemonSetList,
  DeploymentList,
  JobList,
  Metric,
  PodList,
  ReplicaSetList,
  ReplicationControllerList,
  StatefulSetList,
} from '@api/backendapi';
import {OnListChangeEvent, ResourcesRatio} from '@api/frontendapi';

import {ListGroupIdentifier, ListIdentifier} from '../common/components/resourcelist/groupids';
import {emptyResourcesRatio} from '../common/components/workloadstatus/component';
import {GroupedResourceList} from '../common/resources/groupedlist';

import {Helper, ResourceRatioModes} from './helper';

@Component({
  selector: 'kd-overview',
  templateUrl: './template.html',
})
export class OverviewComponent extends GroupedResourceList {
  hasWorkloads(): boolean {
    return this.isGroupVisible(ListGroupIdentifier.workloads);
  }

  hasDiscovery(): boolean {
    return this.isGroupVisible(ListGroupIdentifier.discovery);
  }

  hasConfig(): boolean {
    return this.isGroupVisible(ListGroupIdentifier.config);
  }

  showWorkloadStatuses(): boolean {
    return Object.values(this.resourcesRatio).reduce((sum, ratioItems) => sum + ratioItems.length, 0) !== 0;
  }
}
