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
    this.resourcesRatio.cronJobRatio = this.getCronJobRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.daemonSetRatio = this.getDaemonSetRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.deploymentRatio = this.getDeploymentRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.jobRatio = this.getJobRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.podRatio = this.getPodRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.replicaSetRatio = this.getReplicaSetRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.rcRatio = this.getRCRatio();
    /** @export {Array<Object>} */
    this.resourcesRatio.statefulSetRatio = this.getStatefulSetRatio();
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.overview.deploymentList.listMeta.totalItems +
        this.overview.replicaSetList.listMeta.totalItems +
        this.overview.cronJobList.listMeta.totalItems + this.overview.jobList.listMeta.totalItems +
        this.overview.replicationControllerList.listMeta.totalItems +
        this.overview.podList.listMeta.totalItems +
        this.overview.daemonSetList.listMeta.totalItems +
        this.overview.statefulSetList.listMeta.totalItems +
        this.overview.serviceList.listMeta.totalItems +
        this.overview.ingressList.listMeta.totalItems +
        this.overview.configMapList.listMeta.totalItems +
        this.overview.secretList.listMeta.totalItems +
        this.overview.persistentVolumeClaimList.listMeta.totalItems;

    return resourcesLength === 0;
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldShowWorkloadStatuses() {
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
   * @return {!Array<Object>}
   * @export
   */
  getCronJobRatio() {
    return this.overview.cronJobList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.cronJobList.status.running}`,
            value: this.overview.cronJobList.status.running /
                this.overview.cronJobList.listMeta.totalItems * 100,
          },
          {
            key: `Suspended: ${this.overview.cronJobList.status.failed}`,
            value: this.overview.cronJobList.status.failed /
                this.overview.cronJobList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getDaemonSetRatio() {
    return this.overview.daemonSetList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.daemonSetList.status.running}`,
            value: this.overview.daemonSetList.status.running /
                this.overview.daemonSetList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.daemonSetList.status.failed}`,
            value: this.overview.daemonSetList.status.failed /
                this.overview.daemonSetList.listMeta.totalItems * 100,
          },
          {
            key: `Pending: ${this.overview.daemonSetList.status.pending}`,
            value: this.overview.daemonSetList.status.pending /
                this.overview.daemonSetList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getDeploymentRatio() {
    return this.overview.deploymentList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.deploymentList.status.running}`,
            value: this.overview.deploymentList.status.running /
                this.overview.deploymentList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.deploymentList.status.failed}`,
            value: this.overview.deploymentList.status.failed /
                this.overview.deploymentList.listMeta.totalItems * 100,
          },
          {
            key: `Pending: ${this.overview.deploymentList.status.pending}`,
            value: this.overview.deploymentList.status.pending /
                this.overview.deploymentList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getJobRatio() {
    return this.overview.jobList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.jobList.status.running}`,
            value: this.overview.jobList.status.running /
                this.overview.jobList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.jobList.status.failed}`,
            value: this.overview.jobList.status.failed / this.overview.jobList.listMeta.totalItems *
                100,
          },
          {
            key: `Pending: ${this.overview.jobList.status.pending}`,
            value: this.overview.jobList.status.pending /
                this.overview.jobList.listMeta.totalItems * 100,
          },
          {
            key: `Succeeded: ${this.overview.jobList.status.succeeded}`,
            value: this.overview.jobList.status.succeeded /
                this.overview.jobList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getPodRatio() {
    return this.overview.podList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.podList.status.running}`,
            value: this.overview.podList.status.running /
                this.overview.podList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.podList.status.failed}`,
            value: this.overview.podList.status.failed / this.overview.podList.listMeta.totalItems *
                100,
          },
          {
            key: `Pending: ${this.overview.podList.status.pending}`,
            value: this.overview.podList.status.pending /
                this.overview.podList.listMeta.totalItems * 100,
          },
          {
            key: `Succeeded: ${this.overview.podList.status.succeeded}`,
            value: this.overview.podList.status.succeeded /
                this.overview.podList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getReplicaSetRatio() {
    return this.overview.replicaSetList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.replicaSetList.status.running}`,
            value: this.overview.replicaSetList.status.running /
                this.overview.replicaSetList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.replicaSetList.status.failed}`,
            value: this.overview.replicaSetList.status.failed /
                this.overview.replicaSetList.listMeta.totalItems * 100,
          },
          {
            key: `Pending: ${this.overview.replicaSetList.status.pending}`,
            value: this.overview.replicaSetList.status.pending /
                this.overview.replicaSetList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getRCRatio() {
    return this.overview.replicationControllerList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.replicationControllerList.status.running}`,
            value: this.overview.replicationControllerList.status.running /
                this.overview.replicationControllerList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.replicationControllerList.status.failed}`,
            value: this.overview.replicationControllerList.status.failed /
                this.overview.replicationControllerList.listMeta.totalItems * 100,
          },
          {
            key: `Pending: ${this.overview.replicationControllerList.status.pending}`,
            value: this.overview.replicationControllerList.status.pending /
                this.overview.replicationControllerList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }

  /**
   * @return {!Array<Object>}
   * @export
   */
  getStatefulSetRatio() {
    return this.overview.statefulSetList.listMeta.totalItems > 0 ?
        [
          {
            key: `Running: ${this.overview.statefulSetList.status.running}`,
            value: this.overview.statefulSetList.status.running /
                this.overview.statefulSetList.listMeta.totalItems * 100,
          },
          {
            key: `Failed: ${this.overview.statefulSetList.status.failed}`,
            value: this.overview.statefulSetList.status.failed /
                this.overview.statefulSetList.listMeta.totalItems * 100,
          },
          {
            key: `Pending: ${this.overview.statefulSetList.status.pending}`,
            value: this.overview.statefulSetList.status.pending /
                this.overview.statefulSetList.listMeta.totalItems * 100,
          },
        ] :
        [];
  }
}
