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
export default class LimitRangeInfoController {
  /**
   * Constructs pettion controller info object.
   */
  constructor() {
    /**
     * Limit range details. Initialized from the scope.
     * @export {!backendApi.LimitRangeDetail}
     */
    this.limitRange;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays limit range info.
 *
 * @return {!angular.Directive}
 */
export const limitRangeInfoComponent = {
  controller: LimitRangeInfoController,
  templateUrl: 'limitrangedetail/limitrangeinfo.html',
  bindings: {
    /** {!backendApi.LimitRangeDetail} */
    'limitRange': '=',
  },
};

const i18n = {
  /** @export {string} @desc Limit range info details section name. */
  MSG_LIMIT_RANGE_INFO_DETAILS_SECTION: goog.getMsg('Details'),
  /** @export {string} @desc Limit range info details section name entry. */
  MSG_LIMIT_RANGE_INFO_NAME_ENTRY: goog.getMsg('Name'),
  /** @export {string} @desc Limit range info details section namespace entry. */
  MSG_LIMIT_RANGE_INFO_NAMESPACE_ENTRY: goog.getMsg('Namespace'),
};
