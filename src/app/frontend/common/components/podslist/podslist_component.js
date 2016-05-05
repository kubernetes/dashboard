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
export class PodsListController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * List of pods. Initialized from the scope.
     * @export {!Array<!backendApi.Pod>}
     */
    this.pods;

    /**
     * Callback function that returns link to pod logs. Initialized from the scope.
     * @export {!function({pod: !backendApi.Pod}): string}
     */
    this.logsHrefFn;
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {string}
   * @export
   */
  getPodLogsHref(pod) { return this.logsHrefFn({pod: pod}); }
}

/**
 * Definition object for the component that displays replication controller pods card.
 *
 * @type {!angular.Component}
 */
export const podsListComponent = {
  templateUrl: 'common/components/podslist/podslist.html',
  controller: PodsListController,
  bindings: {
    /** {!Array<!backendApi.Pod>} */
    'pods': '=',
    'logsHrefFn': '&',
  },
};
