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

import {stateName as storageClassList} from '../list/state';
import {stateName as parentState, stateUrl} from '../state';
import {ActionBarController} from './actionbar_controller';
import {StorageClassController} from './controller';

/**
 * Config state object for the Storage Class detail view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: `${stateUrl}/:objectName`,
  parent: parentState,
  resolve: {
    'storageClassResource': getStorageClassResource,
    'storageClass': getStorageClass,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': '{{$stateParams.objectName}}',
      'parent': storageClassList,
    },
  },
  views: {
    '': {
      controller: StorageClassController,
      controllerAs: '$ctrl',
      templateUrl: 'storageclass/detail/detail.html',
    },
    [`${actionbarViewName}@${chromeStateName}`]: {
      controller: ActionBarController,
      controllerAs: '$ctrl',
      templateUrl: 'storageclass/detail/actionbar.html',
    },
  },
};

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function getStorageClassResource($resource, $stateParams) {
  return $resource(`api/v1/storageclass/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource} storageClassResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getStorageClass(storageClassResource) {
  return storageClassResource.get().$promise;
}

/**
 * @param {!./../../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function storageClassPersistentVolumesResource($resource, $stateParams) {
  return $resource(`api/v1/storageclass/${$stateParams.objectName}/persistentvolume`);
}
