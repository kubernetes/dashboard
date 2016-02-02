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

/** Name of the state. Can be used in, e.g., $state.go method. */
export const stateName = 'logs';

/**
 * Parameters for this state.
 *
 * All properties are @exported and in sync with URL param names.
 * @final
 */
export class StateParams {
  /**
   * @param {string} namespace
   * @param {string} replicationController
   * @param {string} podId
   * @param {string=} [container]
   */
  constructor(namespace, replicationController, podId, container) {
    /** @export {string} Namespace of this Replication Controller. */
    this.namespace = namespace;

    /** @export {string} Name of this Replication Controller. */
    this.replicationController = replicationController;

    /** @export {string} Id of this Pod. */
    this.podId = podId;

    /** @export {string|undefined} Name of this pod container. */
    this.container = container;
  }
}
