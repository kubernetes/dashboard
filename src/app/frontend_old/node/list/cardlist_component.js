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
export class NodeCardListController {
  /** @export */
  constructor() {
    /** @export {!backendApi.NodeList} - Initialized from binding. */
    this.nodeList;
    /** @export {!angular.Resource} - Initialized from binding. */
    this.nodeListResource;
  }

  /**
   * Returns select id string or undefined if podList or podListResource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'nodes';

    if (this.nodeList !== undefined && this.nodeListResource !== undefined) {
      return selectId;
    }

    return '';
  }
}

/**
 * @return {!angular.Component}
 */
export const nodeCardListComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    'header': '?kdHeader',
    // Optional zerostate content that is shown when there are zero items.
    'zerostate': '?kdEmptyListText',
  },
  controller: NodeCardListController,
  bindings: {
    'nodeList': '<',
    'nodeListResource': '<',
  },
  templateUrl: 'node/list/cardlist.html',
};
