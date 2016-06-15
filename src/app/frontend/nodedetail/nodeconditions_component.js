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
export default class NodeConditionsController {
  /**
   * Constructs node conditions object.
   * @ngInject
   */
  constructor() {
    /**
     * Node conditions. Initialized from the scope.
     * @export {!backendApi.NodeConditionList}
     */
    this.conditions;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays node conditions.
 *
 * @return {!angular.Directive}
 */
export const nodeConditionsComponent = {
  controller: NodeConditionsController,
  templateUrl: 'nodedetail/nodeconditions.html',
  bindings: {
    /** {!backendApi.NodeConditionList} */
    'conditions': '=',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Type' for the condition table header on the node details
      page. */
  MSG_NODE_DETAIL_CONDITION_TYPE_HEADER: goog.getMsg('Type'),
  /** @export {string} @desc Label 'Status' for the condition table header on the node details
      page. */
  MSG_NODE_DETAIL_CONDITION_STATUS_HEADER: goog.getMsg('Status'),
  /** @export {string} @desc Label 'Last heartbeat time' for the condition table header on the node
      details page. */
  MSG_NODE_DETAIL_CONDITION_LAST_HEARTBEAT_TIME_HEADER: goog.getMsg('Last heartbeat time'),
  /** @export {string} @desc Label 'Last transition time' for the condition table header on the node
      details page. */
  MSG_NODE_DETAIL_CONDITION_LAST_TRANSITION_TIME_HEADER: goog.getMsg('Last transition time'),
  /** @export {string} @desc Label 'Reason' for the condition table header on the node details
      page. */
  MSG_NODE_DETAIL_CONDITION_REASON_HEADER: goog.getMsg('Reason'),
  /** @export {string} @desc Label 'Message' for the condition table header on the node details
      page. */
  MSG_NODE_DETAIL_CONDITION_MESSAGE_HEADER: goog.getMsg('Message'),
};
