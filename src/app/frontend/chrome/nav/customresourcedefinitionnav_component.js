// Copyright 2017 The Kubernetes Dashboard Authors.
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

import {stateName as customResourceDefinitionDetailState} from '../../customresourcedefinition/detail/state';
import {stateName as customResourceDefinitionState} from '../../customresourcedefinition/list/state';

/**
 * @final
 */
export class CustomResourceDefinitionNavController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!../../common/state/service.FutureStateService} kdFutureStateService
   * @ngInject
   */
  constructor($resource, kdFutureStateService) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!../../common/state/service.FutureStateService} */
    this.kdFutureStateService_ = kdFutureStateService;

    /** @export {boolean} */
    this.isVisible = false;

    /**
     * Initialized from binding.
     *
     * @export {!Object<string, string>}
     */
    this.states;
  }

  /**
   * Resolve list of available Custom Resource Definitions to fill menu with entries.
   *
   * @export
   */
  $onInit() {
    this.resource_('api/v1/customresourcedefinition').get().$promise.then((result) => {
      if (result && result.customResourceDefinitions &&
          result.customResourceDefinitions.length > 0) {
        Object.assign(this.states, {'customresourcedefinition': customResourceDefinitionState});
        this.isVisible = true;
      }
    });
  }

  /**
   * Returns true if custom resource definition state is active and menu entry should be
   * highlighted.
   *
   * @return {boolean}
   * @export
   */
  isGroupActive() {
    return this.kdFutureStateService_.state.name === customResourceDefinitionState ||
        this.kdFutureStateService_.state.name === customResourceDefinitionDetailState;
  }
}

/**
 * @type {!angular.Component}
 */
export const customResourceDefinitionNavComponent = {
  controller: CustomResourceDefinitionNavController,
  templateUrl: 'chrome/nav/customresourcedefinitionnav.html',
  bindings: {
    'states': '=',
  },
};
