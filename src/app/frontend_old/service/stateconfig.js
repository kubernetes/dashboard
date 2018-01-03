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

import {stateName as chromeStateName} from '../chrome/state';

import {stateName as detailState} from './detail/state';
import {config as detailConfig} from './detail/stateconfig';
import {stateName as listState} from './list/state';
import {config as listConfig} from './list/stateconfig';
import {stateName} from './state';
/**
 * Configures states for the Service resource.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, config)
      .state(listState, listConfig)
      .state(detailState, detailConfig);
}

/**
 * Config state object for the Ingress abstract state.
 *
 * @type {!ui.router.StateConfig}
 */
const config = {
  abstract: true,
  parent: chromeStateName,
  template: '<ui-view/>',
};
