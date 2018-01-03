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

import {actionbarViewName, stateName as chromeStateName} from '../../chrome/state';
import {breadcrumbsConfig} from '../../common/components/breadcrumbs/service';
import {appendDetailParamsToUrl} from '../../common/resource/resourcedetail';
import {stateName as replicationControllers} from '../../replicationcontroller/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import ReplicationControllerDetailController from './controller';

/**
 * Config state object for the Replication Controller detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
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
      templateUrl: 'replicationcontroller/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'replicationcontroller/detail/actionbar.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function replicationControllerResource($resource) {
  return $resource('api/v1/replicationcontroller/:namespace/:name');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function replicationControllerPodsResource($resource) {
  return $resource('api/v1/replicationcontroller/:namespace/:name/pod');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function replicationControllerEventsResource($resource) {
  return $resource('api/v1/replicationcontroller/:namespace/:name/event');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function replicationControllerServicesResource($resource) {
  return $resource('api/v1/replicationcontroller/:namespace/:name/service');
}

/**
 * @param {!angular.Resource} kdRCResource
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerDetails(kdRCResource, $stateParams, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery(
      $stateParams.objectNamespace, $stateParams.objectName);
  return kdRCResource.get(query).$promise;
}
