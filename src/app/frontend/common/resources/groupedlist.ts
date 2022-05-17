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
  NodeList,
  PodList,
  ReplicaSetList,
  ReplicationControllerList,
  ResourceList,
  StatefulSetList,
} from '@api/root.api';
import {OnListChangeEvent, ResourcesRatio, ResourcesAllocation} from '@api/root.ui';

import {Helper, ResourceRatioModes} from '../../overview/helper';
import {FormattedValue} from '@common/components/graph/helper';
import {ListGroupIdentifier, ListIdentifier} from '../components/resourcelist/groupids';
import {emptyResourcesRatio} from '../components/workloadstatus/component';
import {emptyResourcesAllocation} from '../components/clusterstatus/component';

export class GroupedResourceList {
  resourcesRatio: ResourcesRatio = emptyResourcesRatio;
  resourcesAllocation: ResourcesAllocation = emptyResourcesAllocation;
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
      case ListIdentifier.node: {
        const nodes = list as NodeList;
        const ready = nodes.condition.true;
        const notready = nodes.condition.false;
        const unknown = nodes.condition.unknown;
        this.resourcesAllocation.nodeResources = [
          {name: 'Ready: ' + ready, value: ready},
          {name: 'NotReady: ' + notready, value: notready},
          {name: 'Unknown: ' + unknown, value: unknown},
        ];
        const cpuLimits = nodes.allocatedResources.cpuLimits;
        const cpuRequests = nodes.allocatedResources.cpuRequests - cpuLimits;
        const cpuCapacity = nodes.allocatedResources.cpuCapacity - cpuLimits - cpuRequests;
        const memoryLimits = nodes.allocatedResources.memoryLimits;
        const memoryRequests = nodes.allocatedResources.memoryRequests - memoryLimits;
        const memoryCapacity = nodes.allocatedResources.memoryCapacity - memoryLimits - memoryRequests;
        const podAllocation = nodes.allocatedResources.allocatedPods;
        const podCapacity = nodes.allocatedResources.podCapacity - podAllocation;
        const cpuLimitsValue = FormattedValue.NewFormattedCoreValue(nodes.allocatedResources.cpuLimits);
        const cpuRequestsValue = FormattedValue.NewFormattedCoreValue(nodes.allocatedResources.cpuRequests);
        const cpuCapacityValue = FormattedValue.NewFormattedCoreValue(nodes.allocatedResources.cpuCapacity);
        const memoryLimitsValue = FormattedValue.NewFormattedMemoryValue(nodes.allocatedResources.memoryLimits);
        const memoryRequestsValue = FormattedValue.NewFormattedMemoryValue(nodes.allocatedResources.memoryRequests);
        const memoryCapacityValue = FormattedValue.NewFormattedMemoryValue(nodes.allocatedResources.memoryCapacity);
        const podAllocationValue = FormattedValue.NewFormattedPodValue(nodes.allocatedResources.allocatedPods);
        const podCapacityValue = FormattedValue.NewFormattedPodValue(nodes.allocatedResources.podCapacity);
        this.resourcesAllocation.cpuResources = [
          {name: 'Capacity: ' + cpuCapacityValue.value + cpuCapacityValue.suffix, value: cpuCapacity},
          {name: 'Requests: ' + cpuRequestsValue.value + cpuRequestsValue.suffix, value: cpuRequests},
          {name: 'Limits: ' + cpuLimitsValue.value + cpuLimitsValue.suffix, value: cpuLimits},
        ];
        this.resourcesAllocation.memoryResources = [
          {name: 'Capacity: ' + memoryCapacityValue.value + memoryCapacityValue.suffix, value: memoryCapacity},
          {name: 'Requests: ' + memoryRequestsValue.value + memoryRequestsValue.suffix, value: memoryRequests},
          {name: 'Limits: ' + memoryLimitsValue.value + memoryLimitsValue.suffix, value: memoryLimits},
        ];
        this.resourcesAllocation.podResources = [
          {name: 'Capacity: ' + podCapacityValue.value + podCapacityValue.suffix, value: podCapacity},
          {name: 'Allocation: ' + podAllocationValue.value + podAllocationValue.suffix, value: podAllocation},
        ];
        this.cumulativeMetrics = nodes.cumulativeMetrics;
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
