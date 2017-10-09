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
 * Controller for the Custom Resource Definition list view.
 *
 * @final
 */
export class CustomResourceDefinitionListController {
  /**
   * @ngInject
   */
  constructor(customResourceDefinitionList, kdCustomResourceDefinitionListResource) {
    /** @export {!backendApi.CustomResourceDefinitionList} */
    this.customResourceDefinitionList = customResourceDefinitionList;
    /** @export {!angular.Resource} */
    this.customResourceDefinitionListResource = kdCustomResourceDefinitionListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.customResourceDefinitionList.listMeta.totalItems;
    return resourcesLength === 0;
  }
}
