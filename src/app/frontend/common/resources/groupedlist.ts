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

import {
  CronJobList,
  DaemonSetList,
  DeploymentList,
  JobList,
  Metric,
  PodList,
  ReplicaSetList,
  ReplicationControllerList,
  ResourceList,
  StatefulSetList,
} from '@api/root.api';
import {OnListChangeEvent, ResourcesRatio} from '@api/root.ui';

import {Helper, ResourceRatioModes} from '../../overview/helper';
import {ListGroupIdentifier, ListIdentifier} from '../components/resourcelist/groupids';
import {emptyResourcesRatio} from '../components/workloadstatus/component';

export class GroupedResourceList {
  resourcesRatio: ResourcesRatio = emptyResourcesRatio;
  cumulativeMetrics: Metric[] = [];

  private readonly items_: {[id: string]: number} = {};
  private readonly groupItems_: {[groupId: string]: {[id: string]: number}} = {
    [ListGroupIdentifier.cluster]: {},
    [ListGroupIdentifier.workloads]: {},
    [ListGroupIdentifier.discovery]: {},
    [ListGroupIdentifier.config]: {},
  };

  shouldShowZeroState(): boolean {
    let totalItems = 0;
    const ids = Object.keys(this.items_);
    ids.forEach(id => (totalItems += this.items_[id]));
    return totalItems === 0 && ids.length > 0;
  }

  isGroupVisible(groupId: string): boolean {
    let totalItems = 0;
    const ids = Object.keys(this.groupItems_[groupId]);
    ids.forEach(id => (totalItems += this.groupItems_[groupId][id]));
    return totalItems > 0;
  }

  onListUpdate(listEvent: OnListChangeEvent): void {
    this.items_[listEvent.id] = listEvent.items;
    this.groupItems_[listEvent.groupId][listEvent.id] = listEvent.items;

    if (listEvent.filtered) {
      this.items_[listEvent.id] = 1;
    }

    this.updateResourcesRatio_(listEvent.id, listEvent.resourceList);
  }

  private updateResourcesRatio_(identifier: ListIdentifier, list: ResourceList) {
    switch (identifier) {
      case ListIdentifier.cronJob: {
        const cronJobs = list as CronJobList;
        this.resourcesRatio.cronJobRatio = Helper.getResourceRatio(
          cronJobs.status,
          cronJobs.listMeta.totalItems,
          ResourceRatioModes.Suspendable
        );
        break;
      }
      case ListIdentifier.daemonSet: {
        const daemonSets = list as DaemonSetList;
        this.resourcesRatio.daemonSetRatio = Helper.getResourceRatio(daemonSets.status, daemonSets.listMeta.totalItems);
        break;
      }
      case ListIdentifier.deployment: {
        const deployments = list as DeploymentList;
        this.resourcesRatio.deploymentRatio = Helper.getResourceRatio(
          deployments.status,
          deployments.listMeta.totalItems
        );
        break;
      }
      case ListIdentifier.job: {
        const jobs = list as JobList;
        this.resourcesRatio.jobRatio = Helper.getResourceRatio(
          jobs.status,
          jobs.listMeta.totalItems,
          ResourceRatioModes.Completable
        );
        break;
      }
      case ListIdentifier.pod: {
        const pods = list as PodList;
        this.resourcesRatio.podRatio = Helper.getResourceRatio(
          pods.status,
          pods.listMeta.totalItems,
          ResourceRatioModes.Completable
        );
        this.cumulativeMetrics = pods.cumulativeMetrics;
        break;
      }
      case ListIdentifier.replicaSet: {
        const replicaSets = list as ReplicaSetList;
        this.resourcesRatio.replicaSetRatio = Helper.getResourceRatio(
          replicaSets.status,
          replicaSets.listMeta.totalItems
        );
        break;
      }
      case ListIdentifier.replicationController: {
        const replicationControllers = list as ReplicationControllerList;
        this.resourcesRatio.replicationControllerRatio = Helper.getResourceRatio(
          replicationControllers.status,
          replicationControllers.listMeta.totalItems
        );
        break;
      }
      case ListIdentifier.statefulSet: {
        const statefulSets = list as StatefulSetList;
        this.resourcesRatio.statefulSetRatio = Helper.getResourceRatio(
          statefulSets.status,
          statefulSets.listMeta.totalItems
        );
        break;
      }
      default:
        break;
    }
  }
}
