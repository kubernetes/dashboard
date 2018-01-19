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

import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';

import {stateName, StateParams, stateUrl} from './state';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Sign in' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_LOGIN_LABEL: goog.getMsg('Sign in'),
};

/**
 * Configures states for the Login page.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, config);
}

/**
 * Config state object for the Login view.
 *
 * @type {!ui.router.StateConfig}
 */
const config = {
  url: stateUrl,
  params: new StateParams(),
  component: 'kdLogin',
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_LOGIN_LABEL,
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function authenticationModesResource($resource) {
  return $resource('api/v1/login/modes').get().$promise;
}
