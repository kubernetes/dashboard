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

import { Component } from '@angular/core';
import {
  CronJobList,
  DaemonSetList,
  DeploymentList,
  JobList,
  PodList,
  ReplicaSetList,
  ReplicationControllerList,
  StatefulSetList,
} from '@api/backendapi';
import { OnListChangeEvent, ResourcesRatio } from '@api/frontendapi';

import {
  ListGroupIdentifiers,
  ListIdentifiers,
} from '../common/components/resourcelist/groupids';
import { GroupedResourceList } from '../common/resources/groupedlist';

import { Helper, ResourceRatioModes } from './helper';
import { emptyResourcesRatio } from './workloadstatus/component';

@Component({
  selector: 'kd-overview',
  templateUrl: './template.html',
})
export class OverviewComponent extends GroupedResourceList {
  resourcesRatio: ResourcesRatio = emptyResourcesRatio;

  hasWorkloads(): boolean {
    return this.isGroupVisible(ListGroupIdentifiers.workloads);
  }

  hasDiscovery(): boolean {
    return this.isGroupVisible(ListGroupIdentifiers.discovery);
  }

  hasConfig(): boolean {
    return this.isGroupVisible(ListGroupIdentifiers.config);
  }

  updateResourcesRatio(event: OnListChangeEvent) {
    switch (event.id) {
      case ListIdentifiers.cronJob: {
        const cronJobs = event.resourceList as CronJobList;
        this.resourcesRatio.cronJobRatio = Helper.getResourceRatio(
          cronJobs.status,
          cronJobs.listMeta.totalItems,
          ResourceRatioModes.Suspendable
        );
        break;
      }
      case ListIdentifiers.daemonSet: {
        const daemonSets = event.resourceList as DaemonSetList;
        this.resourcesRatio.daemonSetRatio = Helper.getResourceRatio(
          daemonSets.status,
          daemonSets.listMeta.totalItems
        );
        break;
      }
      case ListIdentifiers.deployment: {
        const deployments = event.resourceList as DeploymentList;
        this.resourcesRatio.deploymentRatio = Helper.getResourceRatio(
          deployments.status,
          deployments.listMeta.totalItems
        );
        break;
      }
      case ListIdentifiers.job: {
        const jobs = event.resourceList as JobList;
        this.resourcesRatio.jobRatio = Helper.getResourceRatio(
          jobs.status,
          jobs.listMeta.totalItems,
          ResourceRatioModes.Completable
        );
        break;
      }
      case ListIdentifiers.pod: {
        const pods = event.resourceList as PodList;
        this.resourcesRatio.podRatio = Helper.getResourceRatio(
          pods.status,
          pods.listMeta.totalItems,
          ResourceRatioModes.Completable
        );
        break;
      }
      case ListIdentifiers.replicaSet: {
        const replicaSets = event.resourceList as ReplicaSetList;
        this.resourcesRatio.replicaSetRatio = Helper.getResourceRatio(
          replicaSets.status,
          replicaSets.listMeta.totalItems
        );
        break;
      }
      case ListIdentifiers.replicationController: {
        const replicationControllers = event.resourceList as ReplicationControllerList;
        this.resourcesRatio.replicationControllerRatio = Helper.getResourceRatio(
          replicationControllers.status,
          replicationControllers.listMeta.totalItems
        );
        break;
      }
      case ListIdentifiers.statefulSet: {
        const statefulSets = event.resourceList as StatefulSetList;
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

  showWorkloadStatuses(): boolean {
    return (
      Object.values(this.resourcesRatio).reduce(
        (sum, ratioItems) => sum + ratioItems.length,
        0
      ) !== 0
    );
  }
}
