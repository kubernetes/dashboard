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
import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';

import {SettingsController} from './controller';
import {stateName, stateUrl} from './state';

/**
 * Configures states for the about view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    views: {
      '': {
        controller: SettingsController,
        controllerAs: '$ctrl',
        templateUrl: 'settings/settings.html',
      },
    },
    resolve: {
      'globalSettings': resolveGlobalSettings,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_SETTINGS_LABEL,
      },
    },
  });
}

const i18n = {
  /** @type {string} @desc Label 'Settings' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_SETTINGS_LABEL: goog.getMsg('Settings'),
};

/**
 * @param {!../common/auth/authorizer.AuthorizerService} kdAuthorizerService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveGlobalSettings(kdAuthorizerService) {
  return kdAuthorizerService.proxyGET('api/v1/settings/global');
}
