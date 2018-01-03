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
import {appendDetailParamsToUrl} from '../../common/resource/globalresourcedetail';

import {stateName as nodeList} from '../list/state';
import {stateName as parentState, stateUrl} from '../state';
import {NodeDetailController} from './controller';

/**
 * Config state object for the Node detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'nodeDetailResource': getNodeDetailResource,
    'nodeDetail': getNodeDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': nodeList,
    },
  },
  views: {
    '': {
      controller: NodeDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'node/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {},
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function nodeEventsResource($resource) {
  return $resource('api/v1/node/:name/event');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function nodePodsResource($resource) {
  return $resource('api/v1/node/:name/pod');
}


/**
 * @param {!angular.$resource} $resource
 * @param {!./../../common/resource/globalresourcedetail.GlobalStateParams} $stateParams
 * @return {!angular.Resource}
 * @ngInject
 */
export function getNodeDetailResource($resource, $stateParams) {
  return $resource(`api/v1/node/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} nodeDetailResource
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @param {!./../../common/resource/globalresourcedetail.GlobalStateParams} $stateParams
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getNodeDetail(nodeDetailResource, kdDataSelectService, $stateParams) {
  let query = kdDataSelectService.getDefaultResourceQuery('', $stateParams.objectName);
  return nodeDetailResource.get(query).$promise;
}
