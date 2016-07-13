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

import {SecretListController} from './secretlist_controller';
import {stateName} from './secretlist_state';
import {stateUrl} from './secretlist_state';

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'secretList': resolveSecretList,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_SECRETS_LABEL,
      },
    },
    views: {
      '': {
        controller: SecretListController,
        controllerAs: '$ctrl',
        templateUrl: 'secretlist/secretlist.html',
      },
      [actionbarViewName]: {
        templateUrl: 'secretlist/actionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveSecretList($resource, $stateParams) {
  /** @type {!angular.Resource<!backendApi.SecretList>} */
  let resource = $resource(`api/v1/secret/${$stateParams.namespace || ''}`);
  return resource.get().$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Secrets' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_SECRETS_LABEL: goog.getMsg('Secrets'),
};
