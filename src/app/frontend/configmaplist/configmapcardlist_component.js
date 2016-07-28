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
 * Controller for config map card list.
 *
 * @final
 */
export class ConfigMapCardListController {
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
export const configMapCardListComponent = {
  transclude: true,
  controller: ConfigMapCardListController,
  bindings: {
    'configMapList': '<',
    'configMapListResource': '<',
  },
  templateUrl: 'configmaplist/configmapcardlist.html',
};

const i18n = {
  /** @export {string} @desc Pet set list header: name. */
  MSG_CONFIG_MAP_LIST_HEADER_NAME: goog.getMsg('Name'),
  /** @export {string} @desc Pet set list header: labels. */
  MSG_CONFIG_MAP_LIST_HEADER_LABELS: goog.getMsg('Labels'),
  /** @export {string} @desc Pet set list header: age. */
  MSG_CONFIG_MAP_LIST_HEADER_AGE: goog.getMsg('Age'),
};
