// Copyright 2017 Google Inc. All Rights Reserved.
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

import {stateName as chromeStateName} from 'chrome/state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {RoleListController} from './controller';
import {stateUrl} from '../state';

const i18n = {
  /** @type {string} @desc Label 'Roles' that appears as a breadcrumbs on the action bar.
   */
  MSG_BREADCRUMBS_ACCESS_CONTROL_LABEL: goog.getMsg('Roles'),
};

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export const config = {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'roleList': resolveRoleList,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_ACCESS_CONTROL_LABEL,
      },
    },
    views: {
      '': {
        controller: RoleListController,
        controllerAs: '$ctrl',
        templateUrl: 'role/list/list.html',
      },
    },
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function roleListResource($resource) {
  return $resource('api/v1/rbacrole');
}

/**
 * @param {!angular.Resource} kdRoleListResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolveRoleList(kdRoleListResource, kdPaginationService) {
  /** @type {!backendApi.PaginationQuery} */
  let query = kdPaginationService.getDefaultResourceQuery('');
  return kdRoleListResource.get(query).$promise;
}
