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

import {breadcrumbsConfig} from '../../common/components/breadcrumbs/service';
import {stateName as parentStateName} from '../../config/state';

import {stateName as parentState, stateUrl} from './../state';
import {SecretListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Secrets' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_SECRETS_LABEL: goog.getMsg('Secrets'),
};

/**
 * Config state object for the Secret list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'secretList': resolveSecretList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_SECRETS_LABEL,
      'parent': parentStateName,
    },
  },
  views: {
    '': {
      controller: SecretListController,
      controllerAs: '$ctrl',
      templateUrl: 'secret/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function secretListResource($resource) {
  return $resource('api/v1/secret/:namespace');
}

/**
 * @param {!angular.Resource} kdSecretListResource
 * @param {!./../../chrome/state.StateParams} $stateParams
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveSecretList(kdSecretListResource, $stateParams, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery($stateParams.namespace);
  return kdSecretListResource.get(query).$promise;
}
