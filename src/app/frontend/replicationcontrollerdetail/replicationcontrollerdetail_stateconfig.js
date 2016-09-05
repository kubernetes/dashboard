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
import {stateName as replicationControllers} from 'replicationcontrollerlist/replicationcontrollerlist_state';

import {ActionBarController} from './actionbar_controller';
import ReplicationControllerDetailController from './replicationcontrollerdetail_controller';
import {stateName} from './replicationcontrollerdetail_state';


/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: appendDetailParamsToUrl('/replicationcontroller'),
    parent: chromeStateName,
    resolve: {
      'replicationControllerSpecPodsResource': getReplicationControllerSpecPodsResource,
      'replicationControllerDetail': resolveReplicationControllerDetails,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.objectName}}',
        'parent': replicationControllers,
      },
    },
    views: {
      '': {
        controller: ReplicationControllerDetailController,
        controllerAs: '$ctrl',
        templateUrl: 'replicationcontrollerdetail/replicationcontrollerdetail.html',
      },
      [actionbarViewName]: {
        controller: ActionBarController,
        controllerAs: '$ctrl',
        templateUrl: 'replicationcontrollerdetail/actionbar.html',
      },
    },
  });
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerSpec>}
 * @ngInject
 */
export function getReplicationControllerSpecPodsResource($stateParams, $resource) {
  return $resource(
      `api/v1/replicationcontroller/${$stateParams.objectNamespace}/` +
      `${$stateParams.objectName}/update/pod`);
}

/**
 * @param {!angular.Resource} kdRCResource
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerDetails(kdRCResource, $stateParams, kdPaginationService) {
  let query = kdPaginationService.getDefaultResourceQuery(
      $stateParams.objectNamespace, $stateParams.objectName);
  return kdRCResource.get(query).$promise;
}
