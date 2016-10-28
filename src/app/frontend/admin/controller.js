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
   * @ngInject
   */
  constructor(admin, kdNamespaceListResource, kdNodeListResource, kdPersistentVolumeListResource) {
    /** @export {!backendApi.Admin} */
    this.admin = admin;
    /** @export {!angular.Resource} */
    this.kdNamespaceListResource = kdNamespaceListResource;
    /** @export {!angular.Resource} */
    this.kdNodeListResource = kdNodeListResource;
    /** @export {!angular.Resource} */
    this.kdPersistentVolumeListResource = kdPersistentVolumeListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.admin.nodeList.listMeta.totalItems +
        this.admin.namespaceList.listMeta.totalItems +
        this.admin.persistentVolumeList.listMeta.totalItems;

    return resourcesLength === 0;
  }
}
