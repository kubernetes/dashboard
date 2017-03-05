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

import {stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {ThirdPartyResourceListController} from './list_controller';
import {stateName, stateUrl} from './list_state';

/**
 * Configures states for the Third Party Resource list view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'thirdPartyResourceList': resolveThirdPartyResourceList,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_THIRD_PARTY_RESOURCES_LABEL,
        'parent': '',
      },
    },
    views: {
      '': {
        controller: ThirdPartyResourceListController,
        controllerAs: '$ctrl',
        templateUrl: 'thirdpartyresourcelist/list.html',
      },
    },
  });
}

const i18n = {
  /** @type {string} @desc Label 'Third Party Resources' that appears as a breadcrumbs on the
   action bar. */
  MSG_BREADCRUMBS_THIRD_PARTY_RESOURCES_LABEL: goog.getMsg('Third Party Resources'),
};

/**
 * @param {!angular.Resource} kdThirdPartyResourceListResource
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolveThirdPartyResourceList(
    kdThirdPartyResourceListResource, kdPaginationService) {
  /** @type {!backendApi.PaginationQuery} */
  let query = kdPaginationService.getDefaultResourceQuery('');
  return kdThirdPartyResourceListResource.get(query).$promise;
}
