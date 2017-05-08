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
import {stateName as tprListState} from 'thirdpartyresource/list/state';
import {stateUrl} from './../state';

import {ThirdPartyResourceDetailController} from './controller';

/**
 * Config state object for the Third Party Resource detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: chromeStateName,
  resolve: {
    'tprDetailResource': getTprDetailResource,
    'tprDetail': getTprDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': tprListState,
    },
  },
  views: {
    '': {
      controller: ThirdPartyResourceDetailController,
      controllerAs: '$ctrl',
      templateUrl: 'thirdpartyresource/detail/detail.html',
    },
    [actionbarViewName]: {},
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function thirdPartyResourceObjectsResource($resource) {
  return $resource('api/v1/thirdpartyresource/:name/object');
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ThirdPartyResource>}
 * @ngInject
 */
export function getTprDetailResource($resource, $stateParams) {
  return $resource(`api/v1/thirdpartyresource/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource<!backendApi.ThirdPartyResource>} tprDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getTprDetail(tprDetailResource) {
  return tprDetailResource.get().$promise;
}
