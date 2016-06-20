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
export default class PodInfoController {
  /**
   * Constructs pod info object.
   */
  constructor() {
    /**
     * Pod details. Initialized from the scope.
     * @export {!backendApi.PodDetail}
     */
    this.pod;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Returns link to connected node details page.
   * @return {string}
   * @export
   */
  getNodeDetailsHref() { return `#/node/${this.pod.nodeName}`; }
}

/**
 * Definition object for the component that displays pod info.
 *
 * @return {!angular.Directive}
 */
export const podInfoComponent = {
  controller: PodInfoController,
  templateUrl: 'poddetail/podinfo.html',
  bindings: {
    /** {!backendApi.PodDetail} */
    'pod': '<',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle 'Details' at the top of the resource details column at the
     pod detail view.*/
  MSG_POD_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
  /** @export {string} @desc Label 'Name' for the pod name in details part (left) of the pod
     details view.*/
  MSG_POD_DETAIL_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' for the pod namespace in details part (left) of the
     pod
     details view.*/
  MSG_POD_DETAIL_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Start time' for the pod start time in details part (left) of the
     pod
     details view.*/
  MSG_POD_DETAIL_START_TIME_LABEL: goog.getMsg('Start time'),
  /** @export {string} @desc Label 'Labels' for the pod labels in details part (left) of the pod
     details view.*/
  MSG_POD_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Status' for the pod status in details part (left) of the pod
     details view.*/
  MSG_POD_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
  /** @export {string} @desc Label 'Images' for the pod container images in details part (left) of
     the pod details view.*/
  MSG_POD_DETAIL_IMAGES_LABEL: goog.getMsg('Images'),
  /** @export {string} @desc Subtitle 'Network' at the top of the column about network
     connectivity (right) at the pod detail view.*/
  MSG_POD_DETAIL_NETWORK_SUBTITLE: goog.getMsg('Network'),
  /** @export {string} @desc Label 'Node' for the node a pods is running on, appears in the
     connectivity part (right) of the pod details view.*/
  MSG_POD_DETAIL_NODE_LABEL: goog.getMsg('Node'),
  /** @export {string} @desc Label 'IP' for the pod internal IP, appears in the
     connectivity part (right) of the pod details view.*/
  MSG_POD_DETAIL_IP_LABEL: goog.getMsg('IP'),
};
