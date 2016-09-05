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
export class NodeDetailController {
  /**
   * @param {!backendApi.NodeDetail} nodeDetail
   * @ngInject
   */
  constructor(nodeDetail, kdNodePodsResource, kdNodeEventsResource) {
    /** @export {!backendApi.NodeDetail} */
    this.nodeDetail = nodeDetail;

    /** @export {!angular.Resource} */
    this.podListResource = kdNodePodsResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdNodeEventsResource;

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Title for graph card displaying metrics of one node. */
  MSG_NODE_DETAIL_GRAPH_CARD_TITLE: goog.getMsg('Resource usage history'),
  /** @export {string} @desc Label 'Pods' for the pods section on the node details page. */
  MSG_NODE_DETAIL_PODS_LABEL: goog.getMsg('Pods'),
  /** @export {string} @desc Title for pods card zerostate in node details page. */
  MSG_NODE_DETAIL_PODS_ZEROSTATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for pods card zerostate in node details page. */
  MSG_NODE_DETAIL_PODS_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no Pods scheduled on this Node'),
};
