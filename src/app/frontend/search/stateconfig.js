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
import {DataSelectQueryBuilder} from '../common/dataselect/builder';

import {SearchController} from './controller';
import {stateName, stateUrl} from './state';

/**
 * @return {string}
 */
function getBreadcrumbLabel() {
  return `${i18n.MSG_BREADCRUMBS_SEARCH_LABEL} {{$stateParams.q}}`;
}

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'search': resolveSearch,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': getBreadcrumbLabel(),
      },
    },
    views: {
      '': {
        controller: SearchController,
        controllerAs: '$ctrl',
        templateUrl: 'search/search.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} kdSearchResource
 * @param {!searchApi.StateParams} $stateParams
 * @param {!./../common/namespace/service.NamespaceService} kdNamespaceService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveSearch(
    kdSearchResource, kdSettingsService, $stateParams, kdNamespaceService) {
  let query = new DataSelectQueryBuilder(kdSettingsService.getItemsPerPage())
                  .setNamespace($stateParams.namespace)
                  .setFilterBy($stateParams.q)
                  .build();

  if (kdNamespaceService.isMultiNamespace(query.namespace)) {
    query.namespace = '';
  }

  return kdSearchResource.get(query).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Search' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_SEARCH_LABEL: goog.getMsg('Search for'),
};
