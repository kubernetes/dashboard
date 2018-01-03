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
import {stateName as jobList} from '../../job/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {JobDetailController} from './controller';

/**
 * Config state object for the Job detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'jobDetailResource': getJobDetailResource,
    'jobDetail': getJobDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': jobList,
    },
  },
  views: {
    '': {
      controller: JobDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'job/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      templateUrl: 'job/detail/actionbar.html',
      controller: ActionBarController,
      controllerAs: '$ctrl',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function jobEventsResource($resource) {
  return $resource('api/v1/job/:namespace/:name/event');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function jobPodsResource($resource) {
  return $resource('api/v1/job/:namespace/:name/pod');
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getJobDetailResource($resource, $stateParams) {
  return $resource(`api/v1/job/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} jobDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getJobDetail(jobDetailResource) {
  return jobDetailResource.get().$promise;
}
