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
export default class PersistentVolumeClaimInfoController {
  /**
   * Constructs persistent volume claim controller info object.
   */
  constructor() {
    /**
     * Persistent Volume Claim details. Initialized from the scope.
     * @export {!backendApi.PersistentVolumeClaimDetail}
     */
    this.persistentVolumeClaim;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays persistent volume claim info.
 *
 * @return {!angular.Directive}
 */
export const persistentVolumeClaimInfoComponent = {
  controller: PersistentVolumeClaimInfoController,
  templateUrl: 'persistentvolumeclaimdetail/persistentvolumeclaiminfo.html',
  bindings: {
    /** {!backendApi.PersistentVolumeClaimDetail} */
    'persistentVolumeClaim': '=',
  },
};

/**
 * @param  {!backendApi.PersistentVolumeClaimDetail} persistentVolumeClaim
 * @return {!Object} a dictionary of translatable messages
 */
const i18n = {
  /** @export {string} @desc Persistent volume claim info details section name. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_DETAILS_SECTION: goog.getMsg('Details'),
  /** @export {string} @desc Persistent volume claim info details section name entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_NAME_ENTRY: goog.getMsg('Name'),
  /** @export {string} @desc Persistent volume claim info details section namespace entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_NAMESPACE_ENTRY: goog.getMsg('Namespace'),
  /** @export {string} @desc Persistent volume claim info details section status entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_STATUS_ENTRY: goog.getMsg('Status'),
  /** @export {string} @desc Persistent volume claim info details section volume entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_VOLUME_ENTRY: goog.getMsg('Volume'),
  /** @export {string} @desc Persistent volume claim info details section labels entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_LABELS_ENTRY: goog.getMsg('Labels'),
  /** @export {string} @desc Persistent volume claim info details section capacity entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_CAPACITY_ENTRY: goog.getMsg('Capacity'),
  /** @export {string} @desc Persistent volume claim info details section access modes entry. */
  MSG_PERSISTENT_VOLUME_CLAIM_INFO_ACCESS_MODES_ENTRY: goog.getMsg('Access Modes'),
};
