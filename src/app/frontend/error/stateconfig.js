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

import {authRequired, stateName as chromeStateName} from '../chrome/state';
import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';

import {InternalErrorController} from './controller';
import {stateName, StateParams} from './state';

/**
 * Configures states for the internal error view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    controller: InternalErrorController,
    parent: chromeStateName,
    controllerAs: 'ctrl',
    params: new StateParams(/** @type {!angular.$http.Response} */ ({}), ''),
    templateUrl: 'error/internalerror.html',
    data: {
      [authRequired]: false,
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_ERROR_LABEL,
      },
    },
  });
}

const i18n = {
  /** @type {string} @desc Label for error page for breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_ERROR_LABEL: goog.getMsg('Error'),
};
