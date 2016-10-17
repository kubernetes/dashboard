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
export default class CreatorInfoController {
  /**
   * @ngInject
   */
  constructor() {
    /** @export {!Object} Initialized from a binding. */
    this.creator;

    /** @export */
    this.listResource = 'api/v1/fake';

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * @type {!angular.Component}
 */
export const creatorInfoComponent = {
  controller: CreatorInfoController,
  templateUrl: 'poddetail/creatorinfo.html',
  bindings: {
    'creator': '<',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle at the top of the creator info box on
   * poddetail page
   */
  MSG_CREATOR_DETAILS_SUBTITLE: goog.getMsg('Creator'),
};
