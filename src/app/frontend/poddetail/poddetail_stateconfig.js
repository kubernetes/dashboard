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

import {actionbarViewName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {PodDetailController} from './poddetail_controller';
import {stateName as podList, stateUrl} from 'podlist/podlist_state';
import {stateName} from './poddetail_state';
import {stateName as namespaceStateName} from 'common/namespace/namespace_state';
import {appendDetailParamsToUrl} from 'common/resource/resourcedetail';

/**
 * Configures states for the pod details view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: appendDetailParamsToUrl(stateUrl),
    parent: namespaceStateName,
    resolve: {
      'podDetailResource': getPodDetailResource,
      'podDetail': getPodDetail,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.pod}}',
        'parent': podList,
      },
    },
    views: {
      '': {
        controller: PodDetailController,
        controllerAs: 'ctrl',
        templateUrl: 'poddetail/poddetail.html',
      },
      [actionbarViewName]: {},
    },
  });
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.PodDetail>}
 * @ngInject
 */
export function getPodDetailResource($resource, $stateParams) {
  return $resource(`api/v1/pod/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource<!backendApi.PodDetail>} podDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getPodDetail(podDetailResource) {
  return podDetailResource.get().$promise;
}
