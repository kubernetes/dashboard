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
export default class PetSetInfoController {
  /**
   * Constructs pettion controller info object.
   */
  constructor() {
    /**
     * Pet set details. Initialized from the scope.
     * @export {!backendApi.PetSetDetail}
     */
    this.petSet;

    /** @export */
    this.i18n = i18n(this.petSet);
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() { return this.petSet.podInfo.running === this.petSet.podInfo.desired; }
}

/**
 * Definition object for the component that displays pet set info.
 *
 * @return {!angular.Directive}
 */
export const petSetInfoComponent = {
  controller: PetSetInfoController,
  templateUrl: 'petsetdetail/petsetinfo.html',
  bindings: {
    /** {!backendApi.PetSetDetail} */
    'petSet': '=',
  },
};

/**
 * @param  {!backendApi.PetSetDetail} petSet
 * @return {!Object} a dictionary of translatable messages
 */
function i18n(petSet) {
  return {
    /** @export {string} @desc Title 'Resource details' at the top of the pet set
      details page.*/
    MSG_PET_SET_DETAIL_RESOURCE_DETAILS_TITLE: goog.getMsg('Resource details'),
    /** @export {string} @desc Pet set info details section name. */
    MSG_PET_SET_INFO_DETAILS_SECTION: goog.getMsg('Details'),
    /** @export {string} @desc Pet set info details section name entry. */
    MSG_PET_SET_INFO_NAME_ENTRY: goog.getMsg('Name'),
    /** @export {string} @desc Pet set info details section namespace entry. */
    MSG_PET_SET_INFO_NAMESPACE_ENTRY: goog.getMsg('Namespace'),
    /** @export {string} @desc Pet set info details section labels entry. */
    MSG_PET_SET_INFO_LABELS_ENTRY: goog.getMsg('Labels'),
    /** @export {string} @desc Pet set info details section images entry. */
    MSG_PET_SET_INFO_IMAGES_ENTRY: goog.getMsg('Images'),
    /** @export {string} @desc Pet set info status section name. */
    MSG_PET_SET_INFO_STATUS_SECTION: goog.getMsg('Status'),
    /** @export {string} @desc Pet set info status section pods entry. */
    MSG_PET_SET_INFO_PODS_ENTRY: goog.getMsg('Pods'),
    /** @export {string} @desc Pet set info status section pods status entry. */
    MSG_PET_SET_INFO_PODS_STATUS_ENTRY: goog.getMsg('Pods status'),
    /** @export {string} @desc The message says that that many pods were created
        (pet set details page). */
    MSG_PET_SET_DETAIL_PODS_CREATED_LABEL:
        goog.getMsg('{$podsCount} created', {'podsCount': petSet.podInfo.current}),
    /** @export {string} @desc The message says that that many pods are running
        (pet set details page). */
    MSG_PET_SET_DETAIL_PODS_RUNNING_LABEL:
        goog.getMsg('{$podsCount} running', {'podsCount': petSet.podInfo.running}),
    /** @export {string} @desc The message says that that many pods are pending
        (pet set details page). */
    MSG_PET_SET_DETAIL_PODS_PENDING_LABEL:
        goog.getMsg('{$podsCount} pending', {'podsCount': petSet.podInfo.pending}),
    /** @export {string} @desc The message says that that many pods have failed
        (pet set details page). */
    MSG_PET_SET_DETAIL_PODS_FAILED_LABEL:
        goog.getMsg('{$podsCount} failed', {'podsCount': petSet.podInfo.failed}),
    /** @export {string} @desc The message says that that many pods are desired to run
        (pet set details page). */
    MSG_PET_SET_DETAIL_PODS_DESIRED_LABEL:
        goog.getMsg('{$podsCount} desired', {'podsCount': petSet.podInfo.desired}),
  };
}
