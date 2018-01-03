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

import {stateName as parentStateName} from '../../cluster/state';
import {breadcrumbsConfig} from '../../common/components/breadcrumbs/service';

import {stateName as parentState, stateUrl} from '../state';
import {NodeListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Nodes' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_NODES_LABEL: goog.getMsg('Nodes'),
};

/**
 * Config state object for the Node list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'nodeList': resolveNodeList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_NODES_LABEL,
      'parent': parentStateName,
    },
  },
  views: {
    '': {
      controller: NodeListController,
      controllerAs: '$ctrl',
      templateUrl: 'node/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function nodeListResource($resource) {
  return $resource('api/v1/node');
}

/**
 * @param {!angular.Resource} kdNodeListResource
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolveNodeList(kdNodeListResource, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery('');
  return kdNodeListResource.get(query).$promise;
}
