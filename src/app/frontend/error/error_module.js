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

import chromeModule from 'chrome/chrome_module';

import {stateName, StateParams} from './internalerror_state';
import stateConfig from './internalerror_stateconfig';


/**
 * Angular module for error views.
 */
export default angular
    .module(
        'kubernetesDashboard.error',
        [
          'ui.router',
          chromeModule.name,
        ])
    .config(stateConfig)
    .run(errorConfig);

/**
 * Configures event catchers for the error views.
 *
 * @param {!angular.Scope} $rootScope
 * @param {!ui.router.$state} $state
 * @ngInject
 */
function errorConfig($rootScope, $state) {
  let deregistrationHandler = $rootScope.$on(
      '$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
        if (toState.name !== stateName) {
          $state.go(stateName, new StateParams(error, toParams.namespace));
        }
      });

  $rootScope.$on('$destroy', deregistrationHandler);
}
