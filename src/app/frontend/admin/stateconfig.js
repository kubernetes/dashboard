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

import {AdminController} from './controller';
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
      'admin': resolveResource,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_ADMIN_LABEL,
      },
    },
    views: {
      '': {
        controller: AdminController,
        controllerAs: '$ctrl',
        templateUrl: 'admin/admin.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} kdAdminResource
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveResource(kdAdminResource, kdPaginationService) {
  let paginationQuery = kdPaginationService.getDefaultResourceQuery();
  return kdAdminResource.get(paginationQuery).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Admin' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_ADMIN_LABEL: goog.getMsg('Admin'),
};
