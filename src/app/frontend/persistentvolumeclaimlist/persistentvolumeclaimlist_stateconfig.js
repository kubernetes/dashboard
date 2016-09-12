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

import {PersistentVolumeClaimListController} from './persistentvolumeclaimlist_controller';
import {stateName, stateUrl} from './persistentvolumeclaimlist_state';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'persistentVolumeClaimList': resolvePersistentVolumeClaimList,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_PERSISTENT_VOLUME_CLAIM_LABEL,
      },
    },
    views: {
      '': {
        controller: PersistentVolumeClaimListController,
        controllerAs: '$ctrl',
        templateUrl: 'persistentvolumeclaimlist/persistentvolumeclaimlist.html',
      },
    },
  });
}

/**
 * @param {!angular.Resource} kdPersistentVolumeClaimListResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePersistentVolumeClaimList(
    kdPersistentVolumeClaimListResource, $stateParams, kdPaginationService) {
  let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
  return kdPersistentVolumeClaimListResource.get(query).$promise;
}

const i18n = {
  /** @type {string} @desc Label 'Persistent Volume Claims' that appears as a breadcrumbs on the
     action bar. */
  MSG_BREADCRUMBS_PERSISTENT_VOLUME_CLAIM_LABEL: goog.getMsg('Persistent Volume Claims'),
};
