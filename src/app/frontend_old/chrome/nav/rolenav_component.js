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

import {stateName as roleState} from '../../role/list/state';

/**
 * @final
 */
export class RoleNavController {
  /**
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($resource) {
    /** @export */
    this.isVisible = false;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /**
     * Initialized from binding.
     *
     * @export {!Object<string, string>}
     */
    this.states;
  }

  /**
   * Check status of rbacs in the cluster to show/hide Role menu entry.
   *
   * @export
   */
  $onInit() {
    this.resource_('api/v1/rbac/status').get().$promise.then((result) => {
      if (result && result.enabled) {
        Object.assign(this.states, {'role': roleState});
        this.isVisible = true;
      }
    });
  }
}

/**
 * @type {!angular.Component}
 */
export const roleNavComponent = {
  controller: RoleNavController,
  templateUrl: 'chrome/nav/rolenav.html',
  bindings: {
    'states': '=',
  },
};
