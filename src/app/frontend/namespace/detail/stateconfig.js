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

import {actionbarViewName, stateName as chromeStateName} from 'chrome/state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';
import {appendDetailParamsToUrl} from 'common/resource/globalresourcedetail';

import {stateName as namespaceList} from './../list/state';
import {stateUrl} from './../state';
import {NamespaceDetailController} from './controller';

/**
 * Config state object for the Namespace detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: chromeStateName,
  resolve: {
    'namespaceDetailResource': getNamespaceDetailResource,
    'namespaceDetail': getNamespaceDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': namespaceList,
    },
  },
  views: {
    '': {
      controller: NamespaceDetailController,
      controllerAs: 'ctrl',
      templateUrl: 'namespace/detail/detail.html',
    },
    [actionbarViewName]: {},
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function namespaceEventsResource($resource) {
  return $resource('api/v1/namespace/:name/event');
}

/**
 * @param {!./../../common/resource/globalresourcedetail.GlobalStateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.NamespaceDetail>}
 * @ngInject
 */
export function getNamespaceDetailResource($resource, $stateParams) {
  return $resource(`api/v1/namespace/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource<!backendApi.NamespaceDetail>} namespaceDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getNamespaceDetail(namespaceDetailResource) {
  return namespaceDetailResource.get().$promise;
}
