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
import {stateName as ingressList} from '../../ingress/list/state';

import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {IngressDetailController} from './controller';

/**
 * Config state object for the Ingress list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: appendDetailParamsToUrl(stateUrl),
  parent: parentState,
  resolve: {
    'ingressDetailResource': getIngressDetailResource,
    'ingressDetail': getIngressDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': ingressList,
    },
  },
  views: {
    '': {
      controller: IngressDetailController,
      controllerAs: '$ctrl',
      templateUrl: 'ingress/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'ingress/detail/actionbar.html',
    },
  },
};

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getIngressDetailResource($resource, $stateParams) {
  return $resource(`api/v1/ingress/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} ingressDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getIngressDetail(ingressDetailResource) {
  return ingressDetailResource.get().$promise;
}
