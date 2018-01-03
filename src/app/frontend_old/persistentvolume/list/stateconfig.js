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
import {PersistentVolumeListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /**
   @type {string} @desc Label 'Persistent Volumes' that appears as a breadcrumbs on the action
   bar.
 */
  MSG_BREADCRUMBS_PERSISTENT_VOLUMES_LABEL: goog.getMsg('Persistent Volumes'),
};

/**
 * Config state object for the Persistent Volume list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: parentState,
  resolve: {
    'persistentVolumeList': resolvePersistentVolumeList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_PERSISTENT_VOLUMES_LABEL,
      'parent': parentStateName,
    },
  },
  views: {
    '': {
      controller: PersistentVolumeListController,
      controllerAs: '$ctrl',
      templateUrl: 'persistentvolume/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function persistentVolumeListResource($resource) {
  return $resource('api/v1/persistentvolume');
}

/**
 * @param {!angular.Resource} kdPersistentVolumeListResource
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePersistentVolumeList(kdPersistentVolumeListResource, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery('');
  return kdPersistentVolumeListResource.get(query).$promise;
}
