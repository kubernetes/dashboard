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
 * Controller for persistent volume card list.
 *
 * @final
 */
export class PersistentVolumeCardListController {
  /**
   * @ngInject
   */
  constructor() {
    /** @export */
    this.i18n = i18n;
  }
}

/**
 * @return {!angular.Component}
 */
export const persistentVolumeCardListComponent = {
  transclude: true,
  controller: PersistentVolumeCardListController,
  bindings: {
    'persistentVolumeList': '<',
    'persistentVolumeListResource': '<',
  },
  templateUrl: 'persistentvolumelist/persistentvolumecardlist.html',
};

const i18n = {
  /** @export {string} @desc Persistent volume list header: name. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_NAME: goog.getMsg('Name'),
  /** @export {string} @desc Persistent volume list header: labels. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_LABELS: goog.getMsg('Labels'),
  /** @export {string} @desc Persistent volume list header: capacity. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_CAPACITY: goog.getMsg('Capacity'),
  /** @export {string} @desc Persistent volume list header: access modes. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_ACCESS_MODES: goog.getMsg('Access modes'),
  /** @export {string} @desc Persistent volume list header: status. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_STATUS: goog.getMsg('Status'),
  /** @export {string} @desc Persistent volume list header: claim. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_CLAIM: goog.getMsg('Claim'),
  /** @export {string} @desc Persistent volume list header: reason. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_REASON: goog.getMsg('Reason'),
  /** @export {string} @desc Persistent volume list header: age. */
  MSG_PERSISTENT_VOLUME_LIST_HEADER_AGE: goog.getMsg('Age'),
};
