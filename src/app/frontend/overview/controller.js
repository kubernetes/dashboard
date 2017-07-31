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
export class OverviewController {
  /**
   * @param {!backendApi.Overview} overview
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdStatefulSetListResource
   * @param {!angular.Resource} kdJobListResource
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
      kdDeploymentListResource, kdStatefulSetListResource, kdJobListResource, kdRCListResource,
      kdServiceListResource, kdIngressListResource, kdConfigMapListResource, kdSecretListResource,
      kdPersistentVolumeClaimListResource) {
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

    this.podStats;

    this.runningColor = 'green';
    this.pendingColor = 'yellow';
    this.failingColor = 'red';
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.overview.deploymentList.listMeta.totalItems +
        this.overview.replicaSetList.listMeta.totalItems +
        this.overview.jobList.listMeta.totalItems +
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
   * @return {object}
   * @export
   */
  getPodStats() {
    let podStats = {
      'success': 0,
      'failed': 0,
      'pending': 0,
      'total': this.overview.podList.listMeta.totalItems,
    };

    let pods = this.overview.podList.pods;

    pods.forEach(function(pod) {
      podStats[pod.podStatus.status] += 1;
    });

    podStats.failedPodsFraction = podStats.failed / podStats.total * 100;
    podStats.pendingPodsFraction = podStats.pending / podStats.total * 100;
    podStats.runningPodsFraction = podStats.success / podStats.total * 100;

    this.podStats = podStats;
  }

  $onInit() {
    this.getPodStats();
  }
}
