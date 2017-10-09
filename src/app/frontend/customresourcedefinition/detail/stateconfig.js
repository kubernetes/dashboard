// Copyright 2017 The Kubernetes Dashboard Authors.
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
import {appendDetailParamsToUrl} from '../../common/resource/globalresourcedetail';
import {stateName as crdListState} from '../../customresourcedefinition/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {CustomResourceDefinitionDetailController} from './controller';

/**
 * Config state object for the Custom Resource Definition detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'crdDetailResource': getCrdDetailResource,
    'crdDetail': getCrdDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': crdListState,
    },
  },
  views: {
    '': {
      controller: CustomResourceDefinitionDetailController,
      controllerAs: '$ctrl',
      templateUrl: 'customresourcedefinition/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {},
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function customResourceDefinitionObjectsResource($resource) {
  return $resource('api/v1/customresourcedefinition/:name/object');
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getCrdDetailResource($resource, $stateParams) {
  return $resource(`api/v1/customresourcedefinition/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} crdDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getCrdDetail(crdDetailResource) {
  return crdDetailResource.get().$promise;
}
