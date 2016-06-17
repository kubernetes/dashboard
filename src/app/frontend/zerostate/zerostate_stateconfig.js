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

import {actionbarViewName, stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {stateName as workload} from 'workloads/workloads_state';

import {ZeroStateController} from './zerostate_controller';
import {StateParams, stateName, stateUrl} from './zerostate_state';

/**
 * Configures state for zerostate view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    data: {
      [breadcrumbsConfig]: {
        label: '{{$stateParams.prevState}}',
        parent: workload,
      },
    },
    views: {
      '': {
        controller: ZeroStateController,
        controllerAs: '$ctrl',
        templateUrl: 'zerostate/zerostate.html',
      },
      [actionbarViewName]: {
        templateUrl: 'zerostate/actionbar.html',
      },
    },
    params: new StateParams(),
  });
}

/**
 * Redirects to zerostate view if given resources arr is empty.
 *
 * @param {!Array<?>} resourcesArr
 * @param {!ui.router.$state} $state
 * @param {string} prevStateName
 * @param {!angular.$timeout} $timeout
 * @ngInject
 */
export function redirectToZerostate(resourcesArr, $state, prevStateName, $timeout) {
  // allow original state change to finish before redirecting to new state to avoid error
  if (resourcesArr.length === 0) {
    $timeout(() => { $state.go(stateName, new StateParams(prevStateName)); });
  }
}
