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

import {GlobalStateParams} from 'common/resource/globalresourcedetail';
import {stateName} from 'repositorydetail/repositorydetail_state';

/**
 * Controller for the repository card.
 *
 * @final
 */
export default class RepositoryCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Repository}
     */
    this.repository;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @export */
    this.i18n = i18n;

    /** @export */
    this.typeMeta = {'kind': 'repository'};
  }

  /**
   * Returns true if repository is available.
   * @return {boolean}
   * @export
   */
  isActive() {
    return this.repository.phase === 'Available';
  }

  /**
   * Returns true if repository is in un-avialable.
   * @return {boolean}
   * @export
   */
  isTerminating() {
    return this.repository.phase === 'Terminating';
  }

  /**
   * @return {string}
   * @export
   */
  getRepositoryDetailHref() {
    return this.state_.href(stateName, new GlobalStateParams(this.repository.name));
  }
}

/**
 * @return {!angular.Component}
 */
export const repositoryCardComponent = {
  bindings: {
    'repository': '=',
  },
  controller: RepositoryCardController,
  templateUrl: 'repositorylist/repositorycard.html',
};

const i18n = {
  /** @export {string} @desc Title 'Repository' which is used as a title for the delete
   dialogs (that can be opened from the repository list view.) */
  MSG_REPOSITORY_LIST_REPOSITORY_TITLE: goog.getMsg('Repository'),
};
