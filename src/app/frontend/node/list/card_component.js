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
 * Controller for the node card.
 *
 * @final
 */
class NodeCardController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Node}
     */
    this.node;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * Returns true if node is in ready state, false otherwise.
   * @return {boolean}
   * @export
   */
  isInReadyState() {
    return this.node.ready === 'True';
  }

  /**
   * Returns true if node is in non-ready state, false otherwise.
   * @return {boolean}
   * @export
   */
  isInNotReadyState() {
    return this.node.ready === 'False';
  }

  /**
   * Returns true if node is in unknown state, false otherwise.
   * @return {boolean}
   * @export
   */
  isInUnknownState() {
    return this.node.ready === 'Unknown';
  }

  /**
   * @return {string}
   * @export
   */
  getNodeDetailHref() {
    return this.state_.href(stateName, new GlobalStateParams(this.node.objectMeta.name));
  }
}

/**
 * @return {!angular.Component}
 */
export const nodeCardComponent = {
  bindings: {
    'node': '=',
  },
  controller: NodeCardController,
  templateUrl: 'node/list/card.html',
};
