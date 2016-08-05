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
export default class PersistentVolumeInfoController {
  /**
   * Constructs pettion controller info object.
   */
  constructor() {
    /**
     * Persistent volume details. Initialized from the scope.
     * @export {!backendApi.PersistentVolumeDetail}
     */
    this.persistentVolume;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays persistent volume info.
 *
 * @return {!angular.Directive}
 */
export const persistentVolumeInfoComponent = {
  controller: PersistentVolumeInfoController,
  templateUrl: 'persistentvolumedetail/persistentvolumeinfo.html',
  bindings: {
    /** {!backendApi.PersistentVolumeDetail} */
    'persistentVolume': '=',
  },
};

const i18n = {
  /** @export {string} @desc Persistent volume info details section name. */
  MSG_PERSISTENT_VOLUME_INFO_DETAILS_SECTION: goog.getMsg('Details'),
  /** @export {string} @desc Persistent volume info details section name entry. */
  MSG_PERSISTENT_VOLUME_INFO_NAME_ENTRY: goog.getMsg('Name'),
  /** @export {string} @desc Persistent volume info details section labels entry. */
  MSG_PERSISTENT_VOLUME_INFO_LABELS_ENTRY: goog.getMsg('Labels'),
  /** @export {string} @desc Persistent volume info details section status entry. */
  MSG_PERSISTENT_VOLUME_INFO_STATUS_ENTRY: goog.getMsg('Status'),
  /** @export {string} @desc Persistent volume info details section claim entry. */
  MSG_PERSISTENT_VOLUME_INFO_CLAIM_ENTRY: goog.getMsg('Claim'),
  /** @export {string} @desc Persistent volume info details section reclaim policy entry. */
  MSG_PERSISTENT_VOLUME_INFO_RECLAIM_POLICY_ENTRY: goog.getMsg('Reclaim policy'),
  /** @export {string} @desc Persistent volume info details section access modes entry. */
  MSG_PERSISTENT_VOLUME_INFO_ACCESS_MODES_ENTRY: goog.getMsg('Access modes'),
  /** @export {string} @desc Persistent volume info details section capacity entry. */
  MSG_PERSISTENT_VOLUME_INFO_CAPACITY_ENTRY: goog.getMsg('Capacity'),
  /** @export {string} @desc Persistent volume info details section message entry. */
  MSG_PERSISTENT_VOLUME_INFO_MESSAGE_ENTRY: goog.getMsg('Message'),
};
