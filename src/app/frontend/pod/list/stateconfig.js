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

import {breadcrumbsConfig} from '../../common/components/breadcrumbs/service';
import {stateName as workloadsStateName} from '../../workloads/state';

import {stateName as parentState, stateUrl} from '../state';
import {PodListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Pods' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_PODS_LABEL: goog.getMsg('Pods'),
};

/**
 * Config state object for the Pod list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'podList': resolvePodList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_PODS_LABEL,
      'parent': workloadsStateName,
    },
  },
  views: {
    '': {
      controller: PodListController,
      controllerAs: '$ctrl',
      templateUrl: 'pod/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function podListResource($resource) {
  return $resource('api/v1/pod/:namespace');
}

/**
 * @param {!angular.Resource} kdPodListResource
 * @param {!./../../chrome/state.StateParams} $stateParams
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePodList(kdPodListResource, $stateParams, kdDataSelectService) {
  let dataSelectQuery = kdDataSelectService.getDefaultResourceQuery($stateParams.namespace);
  return kdPodListResource.get(dataSelectQuery).$promise;
}
