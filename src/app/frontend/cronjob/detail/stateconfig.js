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
import {stateName as cronJobList} from '../../cronjob/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {CronJobDetailController} from './controller';

/**
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'cronJobDetailResource': getCronJobDetailResource,
    'cronJobDetail': getCronJobDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': cronJobList,
    },
  },
  views: {
    '': {
      controller: CronJobDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'cronjob/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      templateUrl: 'cronjob/detail/actionbar.html',
      controller: ActionBarController,
      controllerAs: '$ctrl',
    },
  },
};

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getCronJobDetailResource($resource, $stateParams) {
  return $resource(`api/v1/cronjob/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function activeJobsResource($resource) {
  return $resource('api/v1/cronjob/:namespace/:name/job');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function eventsResource($resource) {
  return $resource('api/v1/cronjob/:namespace/:name/event');
}

/**
 * @param {!angular.Resource} cronJobDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getCronJobDetail(cronJobDetailResource) {
  return cronJobDetailResource.get().$promise;
}
