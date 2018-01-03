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
export class SearchController {
  /**
   * @param {!backendApi.Search} search
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdStatefulSetListResource
   * @param {!angular.Resource} kdJobListResource
   * @param {!angular.Resource} kdRCListResource
   * @param {!angular.Resource} kdNamespaceListResource
   * @param {!angular.Resource} kdNodeListResource
   * @param {!angular.Resource} kdPersistentVolumeListResource
   * @param {!angular.Resource} kdRoleListResource
   * @param {!angular.Resource} kdStorageClassListResource
   * @param {!angular.Resource} kdConfigMapListResource
   * @param {!angular.Resource} kdSecretListResource
   * @param {!angular.Resource} kdPersistentVolumeClaimListResource
   * @param {!angular.Resource} kdServiceListResource
   * @param {!angular.Resource} kdIngressListResource
   * @ngInject
   */
  constructor(
      search, kdPodListResource, kdReplicaSetListResource, kdDaemonSetListResource,
      kdDeploymentListResource, kdStatefulSetListResource, kdJobListResource, kdRCListResource,
      kdNamespaceListResource, kdNodeListResource, kdPersistentVolumeListResource,
      kdRoleListResource, kdStorageClassListResource, kdConfigMapListResource, kdSecretListResource,
      kdPersistentVolumeClaimListResource, kdServiceListResource, kdIngressListResource) {
    /** @export {!backendApi.Search} */
    this.search = search;

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
    this.kdNamespaceListResource = kdNamespaceListResource;

    /** @export {!angular.Resource} */
    this.kdNodeListResource = kdNodeListResource;

    /** @export {!angular.Resource} */
    this.kdPersistentVolumeListResource = kdPersistentVolumeListResource;

    /** @export {!angular.Resource} */
    this.kdRoleListResource = kdRoleListResource;

    /** @export {!angular.Resource} */
    this.kdStorageClassListResource = kdStorageClassListResource;

    /** @export {!angular.Resource} */
    this.kdConfigMapListResource = kdConfigMapListResource;
    /** @export {!angular.Resource} */

    this.kdSecretListResource = kdSecretListResource;

    /** @export {!angular.Resource} */
    this.pvcListResource = kdPersistentVolumeClaimListResource;

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
    let resourcesLength = this.search.deploymentList.listMeta.totalItems +
        this.search.replicaSetList.listMeta.totalItems + this.search.jobList.listMeta.totalItems +
        this.search.replicationControllerList.listMeta.totalItems +
        this.search.podList.listMeta.totalItems + this.search.daemonSetList.listMeta.totalItems +
        this.search.statefulSetList.listMeta.totalItems + this.search.nodeList.listMeta.totalItems +
        this.search.namespaceList.listMeta.totalItems +
        this.search.persistentVolumeList.listMeta.totalItems +
        this.search.storageClassList.listMeta.totalItems +
        this.search.configMapList.listMeta.totalItems + this.search.secretList.listMeta.totalItems +
        this.search.persistentVolumeClaimList.listMeta.totalItems +
        this.search.serviceList.listMeta.totalItems + this.search.ingressList.listMeta.totalItems;

    return resourcesLength === 0;
  }
}
