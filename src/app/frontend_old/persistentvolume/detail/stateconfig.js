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

import {stateName as persistentVolumeList} from '../list/state';
import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {PersistentVolumeDetailController} from './controller';

/**
 * Config state object for the Persistent Volume detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: `${stateUrl}/:objectName`,
  parent: parentState,
  resolve: {
    'persistentVolumeDetailResource': getPersistentVolumeDetailResource,
    'persistentVolumeDetail': getPersistentVolumeDetail,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': persistentVolumeList,
    },
  },
  views: {
    '': {
      controller: PersistentVolumeDetailController,
      controllerAs: '$ctrl',
      templateUrl: 'persistentvolume/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'persistentvolume/detail/actionbar.html',
    },
  },
};

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getPersistentVolumeDetailResource($resource, $stateParams) {
  return $resource(`api/v1/persistentvolume/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} persistentVolumeDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getPersistentVolumeDetail(persistentVolumeDetailResource) {
  return persistentVolumeDetailResource.get().$promise;
}
