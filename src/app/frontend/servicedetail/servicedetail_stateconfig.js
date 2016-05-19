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
import {stateName} from './servicedetail_state';
import {stateName as serviceList, stateUrl} from './../servicelist/servicelist_state';
import {ServiceDetailController} from './servicedetail_controller';

/**
 * Configures states for the service details view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: `${stateUrl}/:namespace/:service`,
    resolve: {
      'serviceDetailResource': getServiceDetailResource,
      'serviceDetail': resolveServiceDetail,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.service}}',
        'parent': serviceList,
      },
    },
    views: {
      '': {
        controller: ServiceDetailController,
        controllerAs: 'ctrl',
        templateUrl: 'servicedetail/servicedetail.html',
      },
      [actionbarViewName]: {},
    },
  });
}

/**
 * @param {!./servicedetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ServiceDetail>}
 */
export function getServiceDetailResource($stateParams, $resource) {
  return $resource(`api/v1/services/${$stateParams.namespace}/${$stateParams.service}`);
}

/**
 * @param {!angular.Resource<!backendApi.ServiceDetail>} serviceDetailResource
 * @return {!angular.$q.Promise}
 */
export function resolveServiceDetail(serviceDetailResource) {
  return serviceDetailResource.get().$promise;
}
