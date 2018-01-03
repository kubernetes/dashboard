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

import {OverviewController} from './controller';
import {stateName, stateUrl} from './state';

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'overview': resolveOverview,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_OVERVIEW_LABEL,
      },
    },
    views: {
      '': {
        controller: OverviewController,
        controllerAs: '$ctrl',
        templateUrl: 'overview/overview.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} kdOverviewResource
 * @param {!./../chrome/state.StateParams} $stateParams
 * @param {!./../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveOverview(kdOverviewResource, $stateParams, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery($stateParams.namespace);
  return kdOverviewResource.get(query).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Overview' that appears as a breadcrumb on the action bar. */
  MSG_BREADCRUMBS_OVERVIEW_LABEL: goog.getMsg('Overview'),
};
