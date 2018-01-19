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
import {stateName as deploymentList} from '../../deployment/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {DeploymentDetailController} from './controller';

/**
 * Config state object for the Deployment detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'deploymentDetailResource': getDeploymentDetailResource,
    'deploymentDetail': getDeploymentDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': deploymentList,
    },
  },
  views: {
    '': {
      controller: DeploymentDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'deployment/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'deployment/detail/actionbar.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function deploymentEventsResource($resource) {
  return $resource('api/v1/deployment/:namespace/:name/event');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function deploymentOldReplicaSetsResource($resource) {
  return $resource('api/v1/deployment/:namespace/:name/oldreplicaset');
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getDeploymentDetailResource($resource, $stateParams) {
  return $resource(`api/v1/deployment/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} deploymentDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getDeploymentDetail(deploymentDetailResource) {
  return deploymentDetailResource.get().$promise;
}
