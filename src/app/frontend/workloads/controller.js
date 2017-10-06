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

/**
 * @final
 */
export class WorkloadsController {
  /**
   * @param {!backendApi.Workloads} workloads
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdStatefulSetListResource
   * @param {!angular.Resource} kdCronJobListResource
   * @param {!angular.Resource} kdJobListResource
   * @param {!angular.Resource} kdRCListResource
   * @ngInject
   */
  constructor(
      workloads, kdPodListResource, kdReplicaSetListResource, kdDaemonSetListResource,
      kdDeploymentListResource, kdStatefulSetListResource, kdCronJobListResource, kdJobListResource,
      kdRCListResource) {
    /** @export {!backendApi.Workloads} */
    this.workloads = workloads;

    /** @export {!angular.Resource} */
    this.podListResource = kdPodListResource;

    /** @export {!angular.Resource} */
    this.replicaSetListResource = kdReplicaSetListResource;

    /** @export {!angular.Resource} */
    this.daemonSetListResource = kdDaemonSetListResource;

    /** @export {!angular.Resource} */
    this.deploymentListResource = kdDeploymentListResource;

    /** @export {!angular.Resource} */
    this.statefulSetListResource = kdStatefulSetListResource;

    /** @export {!angular.Resource} */
    this.jobListResource = kdJobListResource;

    /** @export {!angular.Resource} */
    this.cronJobListResource = kdCronJobListResource;

    /** @export {!angular.Resource} */
    this.rcListResource = kdRCListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.workloads.deploymentList.listMeta.totalItems +
        this.workloads.replicaSetList.listMeta.totalItems +
        this.workloads.jobList.listMeta.totalItems +
        this.workloads.cronJobList.listMeta.totalItems +
        this.workloads.replicationControllerList.listMeta.totalItems +
        this.workloads.podList.listMeta.totalItems +
        this.workloads.daemonSetList.listMeta.totalItems +
        this.workloads.statefulSetList.listMeta.totalItems;

    return resourcesLength === 0;
  }
}
