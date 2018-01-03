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

import {GlobalStateParams as ResourceGlobalStateParams} from './globalresourcedetail';

/**
 * Parameters for this state.
 *
 * All properties are @exported and in sync with URL param names.
 */
export class StateParams extends ResourceGlobalStateParams {
  /**
   * @param {string} objectNamespace
   * @param {string} objectName
   */
  constructor(objectNamespace, objectName) {
    super(objectName);

    /** @export {string} Namespace of this object. */
    this.objectNamespace = objectNamespace;
  }
}

export function appendDetailParamsToUrl(baseUrl) {
  return `${baseUrl}/{objectNamespace:[^/]+}/{objectName:[^/]+}`;
}
