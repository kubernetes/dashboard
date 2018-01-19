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

import {GlobalStateParams} from '../../common/resource/globalresourcedetail';
import {stateName} from '../../node/detail/state';

/**
 * @final
 */
class PodInfoController {
  /**
   * Constructs pod info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Pod details. Initialized from the scope.
     * @export {!backendApi.PodDetail}
     */
    this.pod;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * Returns link to connected node details page.
   * @return {string}
   * @export
   */
  getNodeDetailsHref() {
    return this.state_.href(stateName, new GlobalStateParams(this.pod.nodeName));
  }
}

/**
 * Definition object for the component that displays pod info.
 *
 * @return {!angular.Component}
 */
export const podInfoComponent = {
  controller: PodInfoController,
  templateUrl: 'pod/detail/info.html',
  bindings: {
    /** {!backendApi.PodDetail} */
    'pod': '<',
  },
};
