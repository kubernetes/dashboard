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
export default class NodeAllocatedResourcesController {
  /**
   * Constructs node conditions object.
   * @ngInject
   */
  constructor() {
    /**
     * Node allocated resources. Initialized from the scope.
     * @export {!backendApi.NodeAllocatedResources}
     */
    this.allocatedResources;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays node allocated resources.
 *
 * @return {!angular.Directive}
 */
export const nodeAllocatedResourcesComponent = {
  controller: NodeAllocatedResourcesController,
  templateUrl: 'nodedetail/nodeallocatedresources.html',
  bindings: {
    /** {!backendApi.NodeConditionList} */
    'allocatedResources': '=',
  },
};

const i18n = {
  /** @export {string} @desc Label 'CPU requests (cores)' for the allocated resources table header
     on the node details page. */
  MSG_NODE_DETAIL_ALLOCATED_RESOURCES_CPU_REQUESTS: goog.getMsg('CPU requests (cores)'),
  /** @export {string} @desc Label 'CPU limits (cores)' for the allocated resources table header
     on the node details page. */
  MSG_NODE_DETAIL_ALLOCATED_RESOURCES_CPU_LIMITS: goog.getMsg('CPU limits (cores)'),
  /** @export {string} @desc Label 'Memory requests (bytes)' for the allocated resources table
     header on the node details page. */
  MSG_NODE_DETAIL_ALLOCATED_RESOURCES_MEMORY_REQUESTS: goog.getMsg('Memory requests (bytes)'),
  /** @export {string} @desc Label 'Memory limits (bytes)' for the allocated resources table header
      on the node details page. */
  MSG_NODE_DETAIL_ALLOCATED_RESOURCES_MEMORY_LIMITS: goog.getMsg('Memory limits (bytes)'),
  /** @export {string} @desc Label 'Pods' for the allocated resources table header on the node
      details page. */
  MSG_NODE_DETAIL_ALLOCATED_RESOURCES_PODS: goog.getMsg('Pods'),
};
