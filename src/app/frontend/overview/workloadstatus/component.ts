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

@Component({
  selector: 'kd-workload-statuses',
  templateUrl: './template.html',
})
export class AllocationChartComponent {
  @Input() ratio: any;
  colors: string[] = ['#00c752', '#f00', '#ffad20', '#006028'];

  // /** @export {Array<Object>} */
  // this.resourcesRatio.cronJobRatio = this.getSuspendableResourceRatio(
  //   this.overview.cronJobList.status, this.overview.cronJobList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.daemonSetRatio = this.getDefaultResourceRatio(
  //   this.overview.daemonSetList.status, this.overview.daemonSetList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.deploymentRatio = this.getDefaultResourceRatio(
  //   this.overview.deploymentList.status, this.overview.deploymentList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.jobRatio = this.getCompletableResourceRatio(
  //   this.overview.jobList.status, this.overview.jobList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.podRatio = this.getCompletableResourceRatio(
  //   this.overview.podList.status, this.overview.podList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.replicaSetRatio = this.getDefaultResourceRatio(
  //   this.overview.replicaSetList.status, this.overview.replicaSetList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.rcRatio = this.getDefaultResourceRatio(
  //   this.overview.replicationControllerList.status,
  //   this.overview.replicationControllerList.listMeta.totalItems);
  // /** @export {Array<Object>} */
  // this.resourcesRatio.statefulSetRatio = this.getDefaultResourceRatio(
  //   this.overview.statefulSetList.status, this.overview.statefulSetList.listMeta.totalItems);

  // getSuspendableResourceRatio(status, totalItems) {
  //   return totalItems > 0 ?
  //     [
  //       {
  //         key: `Running: ${status.running}`,
  //         value: status.running / totalItems * 100,
  //       },
  //       {
  //         key: `Suspended: ${status.failed}`,
  //         value: status.failed / totalItems * 100,
  //       },
  //     ] :
  //     [];
  // }
  //
  // getDefaultResourceRatio(status, totalItems) {
  //   return totalItems > 0 ?
  //     [
  //       {
  //         key: `Running: ${status.running}`,
  //         value: status.running / totalItems * 100,
  //       },
  //       {
  //         key: `Failed: ${status.failed}`,
  //         value: status.failed / totalItems * 100,
  //       },
  //       {
  //         key: `Pending: ${status.pending}`,
  //         value: status.pending / totalItems * 100,
  //       },
  //     ] :
  //     [];
  // }
  //
  // getCompletableResourceRatio(status, totalItems) {
  //   return totalItems > 0 ?
  //     [
  //       {
  //         key: `Running: ${status.running}`,
  //         value: status.running / totalItems * 100,
  //       },
  //       {
  //         key: `Failed: ${status.failed}`,
  //         value: status.failed / totalItems * 100,
  //       },
  //       {
  //         key: `Pending: ${status.pending}`,
  //         value: status.pending / totalItems * 100,
  //       },
  //       {
  //         key: `Succeeded: ${status.succeeded}`,
  //         value: status.succeeded / totalItems * 100,
  //       },
  //     ] :
  //     [];
  // }
}
