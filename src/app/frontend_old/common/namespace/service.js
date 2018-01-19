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

import {ALL_NAMESPACES} from './component';

/**
 * Service class for registering namespace.
 * @final
 */
export class NamespaceService {
  /**
   * @param {!./../../chrome/state.StateParams} $stateParams
   * @ngInject
   */
  constructor($stateParams) {
    /** @private {!./../../chrome/state.StateParams} */
    this.stateParams_ = $stateParams;
  }

  /**
   * @return {boolean}
   */
  areMultipleNamespacesSelected() {
    return this.stateParams_.namespace === ALL_NAMESPACES;
  }

  /**
   * Returns true when the given namespace string is in fact selector for all namespaces.
   * @param {string|undefined} namespace
   * @return {boolean}
   */
  isMultiNamespace(namespace) {
    return namespace === ALL_NAMESPACES;
  }
}
