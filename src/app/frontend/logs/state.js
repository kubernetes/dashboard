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

import {StateParams as ResourceStateParams} from '../common/resource/resourcedetail';

/** Name of the state. Can be used in, e.g., $state.go method. */
export const stateName = 'log';

/**
 * Parameters for this state.
 *
 * All properties are @exported and in sync with URL param names.
 * @final
 */
export class StateParams extends ResourceStateParams {
  /**
   * @param {string} objectNamespace
   * @param {string} objectName
   * @param {string} resourceType
   */
  constructor(objectNamespace, objectName, resourceType) {
    super(objectNamespace, objectName);

    /** @export {string} Resource type (e.g. ReplicaSet, Pod) */
    this.resourceType = resourceType;
  }
}
