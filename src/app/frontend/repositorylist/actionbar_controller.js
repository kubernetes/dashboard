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
export class ActionBarController {
  /**
   * @param {!./repository_service.RepositoryService} kdRepositoryService
   * @ngInject
   */
  constructor(kdRepositoryService) {
    /** @export */
    this.i18n = i18n;

    /** @private {!./repository_service.RepositoryService} */
    this.kdRepositoryService_ = kdRepositoryService;
  }
  /**
   * Handles adding of repository using dialog.
   * @export
   */
  handleAddRepositoryDialog() {
    this.kdRepositoryService_.showAddRepositoryDialog();
  }
}

const i18n = {
  /** @export {string} @desc Tooltip for the 'Add Repository' button on the action bar of the
      repository list view.*/
  MSG_REPO_LIST_ACTION_BAR_ADD_REPOSITORY_LABEL: goog.getMsg('Add Repository'),
  /** @export {string} @desc Label 'Repository' which appears at the top of the
   add dialog, opened from a repository list page. */
  MSG_REPO_LIST_REPOSITORY_LABEL: goog.getMsg('Repository'),
};
