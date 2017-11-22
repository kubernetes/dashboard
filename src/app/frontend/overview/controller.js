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
export class OverviewController {
  /**
   * @param {!backendApi.Overview} overview
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdStatefulSetListResource
   * @param {!angular.Resource} kdJobListResource
   * @param {!angular.Resource} kdCronJobListResource
   * @param {!angular.Resource} kdRCListResource
   * @param {!angular.Resource} kdServiceListResource
   * @param {!angular.Resource} kdIngressListResource
   * @param {!angular.Resource} kdConfigMapListResource
   * @param {!angular.Resource} kdSecretListResource
   * @param {!angular.Resource} kdPersistentVolumeClaimListResource
   * @ngInject
   */
  constructor(
      overview, kdPodListResource, kdReplicaSetListResource, kdDaemonSetListResource,
      kdDeploymentListResource, kdStatefulSetListResource, kdJobListResource, kdCronJobListResource,
      kdRCListResource, kdServiceListResource, kdIngressListResource, kdConfigMapListResource,
      kdSecretListResource, kdPersistentVolumeClaimListResource) {
    /** @export {!backendApi.Overview} */
    this.overview = overview;

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

    /** @export {!angular.Resource} */
    this.kdServiceListResource = kdServiceListResource;

    /** @export {!angular.Resource} */
    this.kdIngressListResource = kdIngressListResource;

    /** @export {!angular.Resource} */
    this.kdConfigMapListResource = kdConfigMapListResource;

    /** @export {!angular.Resource} */
    this.kdSecretListResource = kdSecretListResource;

    /** @export {!angular.Resource} */
    this.pvcListResource = kdPersistentVolumeClaimListResource;

    /** @export {!Object<Array<Object>>} */
    this.resourcesRatio = {};
  }

  $onInit() {
    /** @export {Array<Object>} */
    this.resourcesRatio.cronJobRatio = this.getSuspendableResourceRatio(
        this.overview.cronJobList.status, this.overview.cronJobList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.daemonSetRatio = this.getDefaultResourceRatio(
        this.overview.daemonSetList.status, this.overview.daemonSetList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.deploymentRatio = this.getDefaultResourceRatio(
        this.overview.deploymentList.status, this.overview.deploymentList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.jobRatio = this.getCompletableResourceRatio(
        this.overview.jobList.status, this.overview.jobList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.podRatio = this.getCompletableResourceRatio(
        this.overview.podList.status, this.overview.podList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.replicaSetRatio = this.getDefaultResourceRatio(
        this.overview.replicaSetList.status, this.overview.replicaSetList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.rcRatio = this.getDefaultResourceRatio(
        this.overview.replicationControllerList.status,
        this.overview.replicationControllerList.listMeta.totalItems);
    /** @export {Array<Object>} */
    this.resourcesRatio.statefulSetRatio = this.getDefaultResourceRatio(
        this.overview.statefulSetList.status, this.overview.statefulSetList.listMeta.totalItems);
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    return !this.shouldShowWorkloadsSection() && !this.shouldShowDiscoverySection() &&
        !this.shouldShowConfigSection();
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldShowWorkloadsSection() {
    /** @type {number} */
    let resourcesLength = this.overview.deploymentList.listMeta.totalItems +
        this.overview.replicaSetList.listMeta.totalItems +
        this.overview.cronJobList.listMeta.totalItems + this.overview.jobList.listMeta.totalItems +
        this.overview.replicationControllerList.listMeta.totalItems +
        this.overview.podList.listMeta.totalItems +
        this.overview.daemonSetList.listMeta.totalItems +
        this.overview.statefulSetList.listMeta.totalItems;

    return resourcesLength !== 0;
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldShowDiscoverySection() {
    /** @type {number} */
    let resourcesLength = this.overview.serviceList.listMeta.totalItems +
        this.overview.ingressList.listMeta.totalItems;

    return resourcesLength !== 0;
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldShowConfigSection() {
    /** @type {number} */
    let resourcesLength = this.overview.configMapList.listMeta.totalItems +
        this.overview.secretList.listMeta.totalItems +
        this.overview.persistentVolumeClaimList.listMeta.totalItems;

    return resourcesLength !== 0;
  }

  /**
   * @param {!backendApi.Status} status
   * @param {number} totalItems
   * @return {!Array<Object>}
   * @export
   */
  getSuspendableResourceRatio(status, totalItems) {
    return totalItems > 0 ?
        [
          {
            key: `Running: ${status.running}`,
            value: status.running / totalItems * 100,
          },
          {
            key: `Suspended: ${status.failed}`,
            value: status.failed / totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @param {!backendApi.Status} status
   * @param {number} totalItems
   * @return {!Array<Object>}
   * @export
   */
  getDefaultResourceRatio(status, totalItems) {
    return totalItems > 0 ?
        [
          {
            key: `Running: ${status.running}`,
            value: status.running / totalItems * 100,
          },
          {
            key: `Failed: ${status.failed}`,
            value: status.failed / totalItems * 100,
          },
          {
            key: `Pending: ${status.pending}`,
            value: status.pending / totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @param {!backendApi.Status} status
   * @param {number} totalItems
   * @return {!Array<Object>}
   * @export
   */
  getCompletableResourceRatio(status, totalItems) {
    return totalItems > 0 ?
        [
          {
            key: `Running: ${status.running}`,
            value: status.running / totalItems * 100,
          },
          {
            key: `Failed: ${status.failed}`,
            value: status.failed / totalItems * 100,
          },
          {
            key: `Pending: ${status.pending}`,
            value: status.pending / totalItems * 100,
          },
          {
            key: `Succeeded: ${status.succeeded}`,
            value: status.succeeded / totalItems * 100,
          },
        ] :
        [];
  }
}
