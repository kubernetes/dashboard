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

import {stateName as statefulSetList} from '../list/state';
import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {StatefulSetDetailController} from './controller';

/**
 * Config state object for the Stateful Set detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'statefulSetDetailResource': getStatefulSetDetailResource,
    'statefulSetDetail': getStatefulSetDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': statefulSetList,
    },
  },
  views: {
    '': {
      controller: StatefulSetDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'statefulset/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'statefulset/detail/actionbar.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function statefulSetPodsResource($resource) {
  return $resource('api/v1/statefulset/:namespace/:name/pod');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function statefulSetEventsResource($resource) {
  return $resource('api/v1/statefulset/:namespace/:name/event');
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getStatefulSetDetailResource($resource, $stateParams) {
  return $resource(`api/v1/statefulset/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} statefulSetDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getStatefulSetDetail(statefulSetDetailResource) {
  return statefulSetDetailResource.get().$promise;
}
