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
export class ThirdPartyResourceCardListController {
  /** @export */
  constructor() {
    /** @export {!backendApi.ThirdPartyResourceList} - Initialized from binding. */
    this.thirdPartyResourceList;
    /** @export {!angular.Resource} Initialized from binding. */
    this.thirdPartyResourceListResource;
  }

  /**
   * Returns select id string or undefined if list or list resource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'thirdpartyresources';

    if (this.thirdPartyResourceList !== undefined &&
        this.thirdPartyResourceListResource !== undefined) {
      return selectId;
    }

    return '';
  }
}

/**
 * Definition object for the component that displays third party resource list card.
 *
 * @type {!angular.Component}
 */
export const thirdPartyResourceCardListComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    'header': '?kdHeader',
    // Optional zerostate content that is shown when there are zero items.
    'zerostate': '?kdEmptyListText',
  },
  controller: ThirdPartyResourceCardListController,
  templateUrl: 'thirdpartyresource/list/cardlist.html',
  bindings: {
    /** {!backendApi.ThirdPartyResourceList} */
    'thirdPartyResourceList': '=',
    'thirdPartyResourceListResource': '=',
  },
};
