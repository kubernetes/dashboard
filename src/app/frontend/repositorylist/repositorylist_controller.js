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
 * Controller for the repository list view.
 *
 * @final
 */
export class RepositoryListController {
  /**
   * @param {!backendApi.RepositoryList} repositoryList
   * @param {!angular.$resource} kdRepositoryListResource
   * @ngInject
   */
  constructor(repositoryList, kdRepositoryListResource) {
    /** @export {!backendApi.RepositoryList} */
    this.repositoryList = repositoryList;

    /** @export {!angular.$resource} */
    this.repositoryListResource = kdRepositoryListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    return this.repositoryList.totalItems === 0;
  }
}
