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
import {stateName as parentStateName} from '../../config/state';

import {stateName as parentState, stateUrl} from '../state';
import {ConfigMapListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Config Maps' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_CONFIG_MAPS_LABEL: goog.getMsg('Config Maps'),
};

/**
 * Config state object for the Config Map list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'configMapList': resolveConfigMapList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_CONFIG_MAPS_LABEL,
      'parent': parentStateName,
    },
  },
  views: {
    '': {
      controller: ConfigMapListController,
      controllerAs: '$ctrl',
      templateUrl: 'configmap/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function configMapListResource($resource) {
  return $resource('api/v1/configmap/:namespace');
}

/**
 * @param {!angular.Resource} kdConfigMapListResource
 * @param {!./../../chrome/state.StateParams} $stateParams
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveConfigMapList(kdConfigMapListResource, $stateParams, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery($stateParams.namespace);
  return kdConfigMapListResource.get(query).$promise;
}
