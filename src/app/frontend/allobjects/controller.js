// Copyright 2017 The Kubernetes Dashboard Authors.
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
export class AllObjectsController {
  /**
   * @param {!backendApi.AllObjects} allObjects
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdStatefulSetListResource
   * @param {!angular.Resource} kdJobListResource
   * @param {!angular.Resource} kdRCListResource
   * @param {!angular.Resource} kdServiceListResource
   * @param {!angular.Resource} kdIngressListResource
   * @ngInject
   */
  constructor(
      allObjects, kdPodListResource, kdReplicaSetListResource, kdDaemonSetListResource,
      kdDeploymentListResource, kdStatefulSetListResource, kdJobListResource, kdRCListResource,
      kdServiceListResource, kdIngressListResource) {
    /** @export {!backendApi.Workloads} */
    this.allObjects = allObjects;

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
    this.rcListResource = kdRCListResource;

    /** @export {!angular.Resource} */
    this.kdServiceListResource = kdServiceListResource;

    /** @export {!angular.Resource} */
    this.kdIngressListResource = kdIngressListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.allObjects.deploymentList.listMeta.totalItems +
        this.allObjects.replicaSetList.listMeta.totalItems +
        this.allObjects.jobList.listMeta.totalItems +
        this.allObjects.replicationControllerList.listMeta.totalItems +
        this.allObjects.podList.listMeta.totalItems +
        this.allObjects.daemonSetList.listMeta.totalItems +
        this.allObjects.statefulSetList.listMeta.totalItems +
        this.allObjects.serviceList.listMeta.totalItems +
        this.allObjects.ingressList.listMeta.totalItems;

    return resourcesLength === 0;
  }
}
