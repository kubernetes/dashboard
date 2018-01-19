// Copyright 2017 The Kubernetes Authors.
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
export class EndpointCardListController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Initialized from the scope.
     * @export {!backendApi.EndpointList}
     */
    this.endpointList;

    /** @export {!angular.Resource} Initialized from binding. */
    this.endpointListResource;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Returns select id string or undefined if list or list resource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'endpoints';

    if (this.endpointList !== undefined && this.endpointListResource !== undefined) {
      return selectId;
    }

    return '';
  }

  /**
   * Returns true if there are endpoints to display.
   *
   * @returns {boolean}
   * @export
   */
  hasEndpoints() {
    return this.endpointList !== undefined && this.endpointList.endpoints.length > 0;
  }
}

/**
 * Definition object for the component that displays endpoints card.
 *
 * @type {!angular.Component}
 */
export const endpointCardListComponent = {
  templateUrl: 'endpoint/cardlist.html',
  controller: EndpointCardListController,
  bindings: {
    /** {!backendApi.EndpointList} */
    'endpointList': '<',
    /** {!angular.Resource} */
    'endpointListResource': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Warning' for the endpoint selection drop-down. */
  MSG_ENDPOINTS_WARNING_LABEL: goog.getMsg('Warning'),
};
