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
export default class NodeInfoController {
  /**
   * Constructs node info object.
   * @param {!angular.$interpolate} $interpolate

   */
  constructor($interpolate) {
    /**
     * Node details. Initialized from the scope.
     * @export {!backendApi.NodeDetail}
     */
    this.node;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @export */
    this.i18n = i18n();
  }

  /**
   * @export
   * @param  {string} creationDate - creation date of the node
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * node. */
    let MSG_NODE_DETAIL_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_NODE_DETAIL_CREATED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays node info.
 *
 * @return {!angular.Directive}
 */
export const nodeInfoComponent = {
  controller: NodeInfoController,
  templateUrl: 'nodedetail/nodeinfo.html',
  bindings: {
    /** {!backendApi.NodeDetail} */
    'node': '=',
  },
};

/**
 * @return {!Object} a dictionary of translatable messages
 */
function i18n() {
  return {
    /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a node on the node details page.*/
    MSG_NODE_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
    /** @export {string} @desc Label 'Age' for the node namespace on the node details page.*/
    MSG_NODE_DETAIL_AGE_LABEL: goog.getMsg('Age'),
    /** @export {string} @desc Label 'Name' for the node name on the node details page.*/
    MSG_NODE_DETAIL_NAME_LABEL: goog.getMsg('Name'),
    /** @export {string} @desc Label 'Label selector' for the node's labels list on the node
        details page.*/
    MSG_NODE_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
    /** @export {string} @desc Label 'Images' for the list of images used in a node, on its details
        page. */
    MSG_NODE_DETAIL_IMAGES_LABEL: goog.getMsg('Images'),
    /** @export {string} @desc Subtitle 'Status' for the right section with pod status information
        on the node details page.*/
    /** @export {string} @desc Subtitle 'System info' for the right section with general information
     about node system on the node details page.*/
    MSG_NODE_DETAIL_SYSTEM_SUBTITLE: goog.getMsg('System info'),
    /** @export {string} @desc Label 'Architecture' for the node architecture displayed on its
        details page. */
    MSG_NODE_DETAIL_ARCHITECTURE_LABEL: goog.getMsg('Architecture'),
    /** @export {string} @desc Label 'Operating system' for the node operating system displayed
        on its details page. */
    MSG_NODE_DETAIL_OPERATING_SYSTEM_LABEL: goog.getMsg('Operating system'),
    /** @export {string} @desc Label 'Kube-Proxy Version' for the node Kube-Proxy version displayed
        on its details page. */
    MSG_NODE_DETAIL_KUBEPROXY_VERSION_LABEL: goog.getMsg('Kube-Proxy Version'),
    /** @export {string} @desc Label 'Kubelet Version' for the node Kubelet version displayed on its
     details page. */
    MSG_NODE_DETAIL_KUBELET_VERSION_LABEL: goog.getMsg('Kubelet Version'),
    /** @export {string} @desc Label 'Container Runtime Version' for the node container runtime
        version displayed on its details page. */
    MSG_NODE_DETAIL_CONTAINER_RUNTIME_VERSION_LABEL: goog.getMsg('Container Runtime Version'),
    /** @export {string} @desc Label 'OS Image' for the node OS image displayed on its details
        page.*/
    MSG_NODE_DETAIL_OS_IMAGE_LABEL: goog.getMsg('OS Image'),
    /** @export {string} @desc Label 'Kernel Version' for the node kernel version displayed on its
       details page.*/
    MSG_NODE_DETAIL_KERNEL_VERSION_LABEL: goog.getMsg('Kernel Version'),
    /** @export {string} @desc Label 'Boot ID' for the node boot ID displayed on its details page.*/
    MSG_NODE_DETAIL_BOOT_ID_LABEL: goog.getMsg('Boot ID'),
    /** @export {string} @desc Label 'System UUID' for the node system UUID displayed on its details
        page.*/
    MSG_NODE_DETAIL_SYSTEM_UUID_LABEL: goog.getMsg('System UUID'),
    /** @export {string} @desc Label 'Machine ID' for the node machine ID displayed on its
        details page.*/
    MSG_NODE_DETAIL_MACHINE_ID_LABEL: goog.getMsg('Machine ID'),
    /** @export {string} @desc Label 'External ID' for the node external ID displayed on its
        details page.*/
    MSG_NODE_DETAIL_EXTERNAL_ID_LABEL: goog.getMsg('External ID'),
    /** @export {string} @desc Label 'Capacity' for the node capacity displayed on its details
        page.*/
    MSG_NODE_DETAIL_CAPACITY_LABEL: goog.getMsg('Capacity'),
  };
}
