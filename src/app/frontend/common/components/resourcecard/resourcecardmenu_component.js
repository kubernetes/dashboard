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
 * Controller for the resource card menu.
 * @final
 */
export class ResourceCardMenuController {
  constructor() {
    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Resource card header columns component. See resource card list for documentation.
 * @type {!angular.Component}
 */
export const resourceCardMenuComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardmenu.html',
  transclude: true,
  controller: ResourceCardMenuController,
};

const i18n = {
  /** @export {string} @desc Tooltip "Actions", which appears when you hover over the menu icon on any resource card. */
  MSG_RESOURCE_CARD_MENU_TOOLTIP: goog.getMsg('Actions'),
};
