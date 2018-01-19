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
export class ClusterController {
  /**
   * @param {!backendApi.Cluster} cluster
   * @param {!angular.Resource} kdNamespaceListResource
   * @param {!angular.Resource} kdNodeListResource
   * @param {!angular.Resource} kdPersistentVolumeListResource
   * @param {!angular.Resource} kdRoleListResource
   * @param {!angular.Resource} kdStorageClassListResource
   * @ngInject
   */
  constructor(
      cluster, kdNamespaceListResource, kdNodeListResource, kdPersistentVolumeListResource,
      kdRoleListResource, kdStorageClassListResource) {
    /** @export {!backendApi.Cluster} */
    this.cluster = cluster;

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
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.cluster.nodeList.listMeta.totalItems +
        this.cluster.namespaceList.listMeta.totalItems +
        this.cluster.persistentVolumeList.listMeta.totalItems +
        this.cluster.roleList.listMeta.totalItems +
        this.cluster.storageClassList.listMeta.totalItems;
    return resourcesLength === 0;
  }
}
