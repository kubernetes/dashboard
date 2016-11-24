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

import {stateName as parentStateName} from 'admin/state';
import {stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {PersistentVolumeListController} from './persistentvolumelist_controller';
import {stateName, stateUrl} from './persistentvolumelist_state';

/**
 * Configures states for persistent volume list view.
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'persistentVolumeList': resolvePersistentVolumeList,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_PERSISTENT_VOLUMES_LABEL,
        'parent': parentStateName,
      },
    },
    views: {
      '': {
        controller: PersistentVolumeListController,
        controllerAs: '$ctrl',
        templateUrl: 'persistentvolumelist/persistentvolumelist.html',
      },
    },
  });
}

/**
 * @param {!angular.Resource} kdPersistentVolumeListResource
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePersistentVolumeList(kdPersistentVolumeListResource, kdPaginationService) {
  /** @type {!backendApi.PaginationQuery} */
  let query = kdPaginationService.getDefaultResourceQuery('');
  return kdPersistentVolumeListResource.get(query).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Persistent Volumes' that appears as a breadcrumbs on the action
     bar. */
  MSG_BREADCRUMBS_PERSISTENT_VOLUMES_LABEL: goog.getMsg('Persistent Volumes'),
};
