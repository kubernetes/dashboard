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

import {StateParams} from 'common/resource/resourcedetail';
import {stateName} from 'releasedetail/releasedetail_state';

/**
 * Controller for the replica set card.
 *
 * @final
 */
export default class ReleaseCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Release}
     */
    this.release;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @return {string}
   * @export
   */
  getReleaseDetailHref() {
    return this.state_.href(stateName, new StateParams(this.release.namespace, this.release.name));
  }

  /**
   * @return {string}
   * @export
   */
  getReleaseStatus() {
    return statusCodes[this.release.info.status.code];
  }

  /**
   * @return {number}
   * @export
   */
  getReleaseRelativeTime() {
    return (new Date()).getTime() - this.release.info.last_deployed.seconds;
  }

  /**
   * Returns true if any of replica set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return false;
  }
  // TODO: Releases

  /**
   * Returns true if replica set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return false;
  }
  // TODO: Releases

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return true;
  }
  // TODO: Releases

  /**
   * @export
   * @param  {string} creationDate - creation date of the release
   * @return {string} localized tooltip with the formatted creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * a release. */
    let MSG_RELEASE_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_RELEASE_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const releaseCardComponent = {
  bindings: {
    'release': '=',
  },
  controller: ReleaseCardController,
  templateUrl: 'releaselist/releasecard.html',
};

const statusCodes = {
  1: 'DEPLOYED'
};

const i18n = {
  /** @export {string} @desc Tooltip saying that some pods in a release have errors. */
  MSG_RELEASE_LIST_PODS_ERRORS_TOOLTIP: goog.getMsg('One or more pods have errors'),
  /** @export {string} @desc Tooltip saying that some pods in a release are pending. */
  MSG_RELEASE_LIST_PODS_PENDING_TOOLTIP: goog.getMsg('One or more pods are in pending state'),
  /** @export {string} @desc Label 'Release' which will appear in the release
      delete dialog opened from a release card on the list page.*/
  MSG_RELEASE_LIST_RELEASE_LABEL: goog.getMsg('Release'),
};
