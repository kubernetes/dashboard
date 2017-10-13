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

import {breadcrumbsConfig} from '../../common/components/breadcrumbs/service';

import {stateName as parentState, stateUrl} from '../state';
import {CustomResourceDefinitionListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /**
   @type {string} @desc Label 'Custom Resource Definitions' that appears as a breadcrumbs on the
   action bar.
 */
  MSG_BREADCRUMBS_CUSTOM_RESOURCE_DEFINITIONS_LABEL: goog.getMsg('Custom Resource Definitions'),
};

/**
 * Config state object for the Custom Resource Definitions list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'customResourceDefinitionList': resolveCustomResourceDefinitionList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_CUSTOM_RESOURCE_DEFINITIONS_LABEL,
      'parent': '',
    },
  },
  views: {
    '': {
      controller: CustomResourceDefinitionListController,
      controllerAs: '$ctrl',
      templateUrl: 'customresourcedefinition/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function customResourceDefinitionListResource($resource) {
  return $resource('api/v1/customresourcedefinition');
}

/**
 * @param {!angular.Resource} kdCustomResourceDefinitionListResource
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolveCustomResourceDefinitionList(
    kdCustomResourceDefinitionListResource, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery();
  return kdCustomResourceDefinitionListResource.get(query).$promise;
}
