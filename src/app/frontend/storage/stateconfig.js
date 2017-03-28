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

import {stateName as chromeStateName} from 'chrome/state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {StorageController} from './controller';
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
      'storage': resolveStorage,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_STORAGE_LABEL,
      },
    },
    views: {
      '': {
        controller: StorageController,
        controllerAs: '$ctrl',
        templateUrl: 'storage/storage.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} kdStorageResource
 * @param {!./../chrome/state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveStorage(kdStorageResource, $stateParams, kdPaginationService) {
  let paginationQuery = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
  return kdStorageResource.get(paginationQuery).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Storage' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_STORAGE_LABEL: goog.getMsg('Storage'),
};
