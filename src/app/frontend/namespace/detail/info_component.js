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
export default class NamespaceInfoController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Namespace details. Initialized from the scope.
     * @export {!backendApi.NamespaceDetail}
     */
    this.namespace;
  }
}

/**
 * Definition object for the component that displays namespace info.
 *
 * @return {!angular.Component}
 */
export const namespaceInfoComponent = {
  controller: NamespaceInfoController,
  templateUrl: 'namespace/detail/info.html',
  bindings: {
    /** {!backendApi.NamespaceDetail} */
    'namespace': '=',
  },
};
