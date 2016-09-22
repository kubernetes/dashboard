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
export default class ResourceLimitsController {
  /**
   * Constructs pettion controller info object.
   */
  constructor() {
    /**
     * Resource Limits. Initialized from the scope.
     * @export {!Array<!backendApi.LimitRange>}
     */
    this.resourceLimits;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays resource limits.
 *
 * @return {!angular.Directive}
 */
export const resourceLimitsComponent = {
  controller: ResourceLimitsController,
  templateUrl: 'limitrangedetail/resourcelimits.html',
  bindings: {
    /** {!Array<!backendApi.LimitRange>} */
    'resourceLimits': '=',
  },
};

const i18n = {
  /** @export {string} @desc Resource Limits name entry. */
  MSG_RESOURCE_LIMIT_TYPE_ENTRY: goog.getMsg('Type'),
  /** @export {string} @desc Resource Limits resource entry. */
  MSG_RESOURCE_LIMIT_RESOURCE_ENTRY: goog.getMsg('Resource'),
  /** @export {string} @desc Resource Limits min entry. */
  MSG_RESOURCE_LIMIT_MIN_ENTRY: goog.getMsg('Min'),
  /** @export {string} @desc Resource Limits max entry. */
  MSG_RESOURCE_LIMIT_MAX_ENTRY: goog.getMsg('Max'),
  /** @export {string} @desc Resource Limits default request entry. */
  MSG_RESOURCE_LIMIT_DEFAULT_REQUEST_ENTRY: goog.getMsg('Default Request'),
  /** @export {string} @desc Resource Limits default limit entry. */
  MSG_RESOURCE_LIMIT_DEFAULT_LIMIT_ENTRY: goog.getMsg('Default Limit'),
  /** @export {string} @desc Resource Limits max limit/request ratio entry. */
  MSG_RESOURCE_LIMIT_MAX_LIMIT_REQUEST_RATIO_ENTRY: goog.getMsg('Max Limit/Request Ratio'),
};
