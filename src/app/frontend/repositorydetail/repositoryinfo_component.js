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
export default class RepositoryInfoController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Repository details. Initialized from the scope.
     * @export {!backendApi.RepositoryDetail}
     */
    this.repository;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays repository info.
 *
 * @return {!angular.Directive}
 */
export const repositoryInfoComponent = {
  controller: RepositoryInfoController,
  templateUrl: 'repositorydetail/repositoryinfo.html',
  bindings: {
    /** {!backendApi.RepositoryDetail} */
    'repository': '=',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a repository on the repository details page.*/
  MSG_REPOSITORY_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
  /** @export {string} @desc Label 'URL' for the repository on the repository details page.*/
  MSG_REPOSITORY_DETAIL_URL_LABEL: goog.getMsg('URL'),
  /** @export {string} @desc Label 'Status' for the repository on the repository details page.*/
  MSG_REPOSITORY_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
};
