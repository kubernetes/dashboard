// Copyright 2015 Google Inc. All Rights Reserved.
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
export class AdminController {
  /**
   * @param {!backendApi.Admin} admin
   * @param {!angular.Resource} kdNamespaceListResource
   * @param {!angular.Resource} kdNodeListResource
   * @param {!angular.Resource} kdPersistentVolumeListResource
   * @param {!angular.Resource} kdRepositoryListResource
   * @ngInject
   */
  constructor(
      admin, kdNamespaceListResource, kdNodeListResource, kdPersistentVolumeListResource,
      kdRepositoryListResource) {
    /** @export {!backendApi.Admin} */
    this.admin = admin;
    /** @export {!angular.Resource} */
    this.kdNamespaceListResource = kdNamespaceListResource;
    /** @export {!angular.Resource} */
    this.kdNodeListResource = kdNodeListResource;
    /** @export {!angular.Resource} */
    this.kdPersistentVolumeListResource = kdPersistentVolumeListResource;
    /** @export {!angular.Resource} */
    this.kdRepositoryListResource = kdRepositoryListResource;
    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   * @suppress {missingProperties}
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.admin.nodeList.listMeta.totalItems +
        this.admin.namespaceList.listMeta.totalItems +
        this.admin.persistentVolumeList.listMeta.totalItems + this.admin.repositoryList.totalItems;

    return resourcesLength === 0;
  }
}

const i18n = {
  /** @export {string} @desc Label that appears above the list of resources. */
  MSG_ADMIN_NAMESPACES_LABEL: goog.getMsg('Namespaces'),
  /** @export {string} @desc Label that appears above the list of resources. */
  MSG_ADMIN_NODES_LABEL: goog.getMsg('Nodes'),
  /** @export {string} @desc Label that appears above the list of resources. */
  MSG_ADMIN_PERSISTENT_VOLUMES_LABEL: goog.getMsg('Persistent Volumes'),
  /** @export {string} @desc Label that appears above the list of repositories. */
  MSG_ADMIN_REPOSITORY_LABEL: goog.getMsg('Repositories'),
};
