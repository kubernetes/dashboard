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

import chromeModule from '../chrome/module';
import {isError, kdErrors} from '../common/errorhandling/errors';
import {stateName as loginState, StateParams as LoginStateParams} from '../login/state';

import {stateName, StateParams} from './state';
import stateConfig from './stateconfig';

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
 * @param {!kdUiRouter.$state} $state
 * @param {!../common/auth/service.AuthService} kdAuthService
 * @ngInject
 */
function errorConfig($state, kdAuthService) {
  $state.defaultErrorHandler((err) => {
    if (isError(err.detail.data, kdErrors.TOKEN_EXPIRED, kdErrors.ENCRYPTION_KEY_CHANGED)) {
      kdAuthService.removeAuthCookies();
      $state.go(loginState, new LoginStateParams(err.detail));
      return;
    }

    $state.go(stateName, new StateParams(err.detail, $state.params.namespace));
  });
}
