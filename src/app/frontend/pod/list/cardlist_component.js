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
export class PodCardListController {
  /**
   * @ngInject
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   */
  constructor(kdNamespaceService) {
    /**
     * List of pods. Initialized from the scope.
     * @export {!backendApi.PodList}
     */
    this.podList;

    /** @export {!angular.Resource} Initialized from binding. */
    this.podListResource;

    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * Returns select id string or undefined if podList or podListResource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'pods';

    if (this.podList !== undefined && this.podListResource !== undefined) {
      return selectId;
    }

    return '';
  }

  /**
   * @return {boolean}
   * @export
   */
  showMetrics() {
    if (this.podList.pods && this.podList.pods.length > 0) {
      let firstPod = this.podList.pods[0];
      return !!firstPod.metrics;
    }
    return false;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * Definition object for the component that displays pods list card.
 *
 * Pod list factory should expose endpoint that will return list of pods (all or related to some
 * resource).
 *
 * @type {!angular.Component}
 */
export const podCardListComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    'header': '?kdHeader',
    // Optional zerostate content that is shown when there are zero items.
    'zerostate': '?kdEmptyListText',
  },
  templateUrl: 'pod/list/cardlist.html',
  controller: PodCardListController,
  bindings: {
    /** {!backendApi.PodList} */
    'podList': '<',
    /** {!angular.Resource} */
    'podListResource': '<',
    /** {boolean} */
    'selectable': '<',
    /** {boolean} */
    'withStatuses': '<',
  },
};
