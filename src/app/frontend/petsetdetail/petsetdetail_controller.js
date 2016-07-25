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
export class PetSetDetailController {
  /**
   * @param {!backendApi.PetSetDetail} petSetDetail
   * @param {!angular.Resource} kdPetSetPodsResource
   * @ngInject
   */
  constructor(petSetDetail, kdPetSetPodsResource) {
    /** @export {!backendApi.PetSetDetail} */
    this.petSetDetail = petSetDetail;

    /** @export {!angular.Resource} */
    this.petSetPodsResource = kdPetSetPodsResource;
    
    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Overview tab label on the pet set detail page. */
  MSG_PET_SET_DETAIL_OVERVIEW_TAB: goog.getMsg('Overview'),
  /** @export {string} @desc Related pods card title on the pet set detail page. */
  MSG_PET_SET_DETAIL_PODS_CARD_TITLE: goog.getMsg('Pods'),
  /** @export {string} @desc Events tab label on the pet set detail page. */
  MSG_PET_SET_DETAIL_EVENTS_TAB: goog.getMsg('Events'),
};
