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

import {actionbarViewName, stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {appendDetailParamsToUrl} from 'common/resource/resourcedetail';
import {stateName as replicaSetList, stateUrl} from 'replicasetlist/replicasetlist_state';

import {ActionBarController} from './actionbar_controller';
import {ReplicaSetDetailController} from './replicasetdetail_controller';
import {stateName} from './replicasetdetail_state';

/**
 * Configures states for the replica set details view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: appendDetailParamsToUrl(stateUrl),
    parent: chromeStateName,
    resolve: {
      'replicaSetDetail': resolveReplicaSetDetailResource,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.objectName}}',
        'parent': replicaSetList,
      },
    },
    views: {
      '': {
        controller: ReplicaSetDetailController,
        controllerAs: 'ctrl',
        templateUrl: 'replicasetdetail/replicasetdetail.html',
      },
      [actionbarViewName]: {
        controller: ActionBarController,
        controllerAs: '$ctrl',
        templateUrl: 'replicasetdetail/actionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.Resource} kdReplicaSetDetailResource
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.Resource<!backendApi.ReplicaSetDetail>}
 * @ngInject
 */
export function resolveReplicaSetDetailResource(
    kdReplicaSetDetailResource, $stateParams, kdPaginationService) {
  let query = kdPaginationService.getDefaultResourceQuery(
      $stateParams.objectNamespace, $stateParams.objectName);
  return kdReplicaSetDetailResource.get(query).$promise;
}
