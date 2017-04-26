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

import {GlobalStateParams} from 'common/resource/globalresourcedetail';
import {stateName} from 'node/detail/state';

/**
 * Controller for the node card.
 *
 * @final
 */
export default class NodeCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Node}
     */
    this.node;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;
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

  /**
   * @export
   * @param  {string} creationDate - creation date of the node
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * node. */
    let MSG_NODE_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_NODE_LIST_CREATED_AT_TOOLTIP;
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
