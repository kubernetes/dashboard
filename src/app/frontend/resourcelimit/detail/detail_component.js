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

/**
 * @final
 */
export default class ResourceLimitsController {
  /**
   * Constructs resource limits controller info object.
   */
  constructor() {
    /**
     * Resource Limits. Initialized from the scope.
     * @export {Array<!backendApi.LimitRange>}
     */
    this.resourceLimits;
  }
}

/**
 * Definition object for the component that displays resource limits.
 *
 * @return {!angular.Component}
 */
export const resourceLimitsComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    'header': '?kdHeader',
  },
  controller: ResourceLimitsController,
  templateUrl: 'resourcelimit/detail/detail.html',
  bindings: {
    /** {Array<!backendApi.LimitRange>} */
    'resourceLimits': '=',
  },
};
