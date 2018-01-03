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

import {ConfigController} from './controller';
import {stateName} from './state';
import {stateUrl} from './state';

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'config': resolveResource,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_CONFIG_AND_STORAGE_LABEL,
      },
    },
    views: {
      '': {
        controller: ConfigController,
        controllerAs: '$ctrl',
        templateUrl: 'config/config.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} kdConfigResource
 * @param {!./../chrome/state.StateParams} $stateParams
 * @param {!./../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveResource(kdConfigResource, $stateParams, kdDataSelectService) {
  let paginationQuery = kdDataSelectService.getDefaultResourceQuery($stateParams.namespace);
  return kdConfigResource.get(paginationQuery).$promise;
}

const i18n = {
  /**
   * @type {string} @desc Label 'Config and storage' that appears as a breadcrumbs on the action
   * bar.
   */
  MSG_BREADCRUMBS_CONFIG_AND_STORAGE_LABEL: goog.getMsg('Config and storage'),
};
