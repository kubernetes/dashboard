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
 * Controller for the pod list view.
 *
 * @final
 */
export class PodListController {
  /**
   * @param {!backendApi.PodList} podList
   * @param {!angular.$resource} kdPodListResource
   * @ngInject
   */
  constructor(podList, kdPodListResource) {
    /** @export {!backendApi.PodList} */
    this.podList = podList;

    /** @export {!angular.$resource} */
    this.podListResource = kdPodListResource;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() { return this.podList.pods.length === 0; }
}

const i18n = {
  /** @export {string} @desc Title for graph card displaying cumulative metrics of pods. */
  MSG_POD_LIST_GRAPH_CARD_TITLE: goog.getMsg('Cumulative resource usage history'),
};
