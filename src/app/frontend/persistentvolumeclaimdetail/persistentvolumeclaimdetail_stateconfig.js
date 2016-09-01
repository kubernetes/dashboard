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

import {actionbarViewName, stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {appendDetailParamsToUrl} from 'common/resource/resourcedetail';
import {stateName as persistentVolumeClaimList, stateUrl} from 'persistentvolumeclaimlist/persistentvolumeclaimlist_state';

import {ActionBarController} from './actionbar_controller';
import {PersistentVolumeClaimDetailController} from './persistentvolumeclaimdetail_controller';
import {stateName} from './persistentvolumeclaimdetail_state';

/**
 * Configures states for the persistent volume claim details view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: appendDetailParamsToUrl(stateUrl),
    parent: chromeStateName,
    resolve: {
      'persistentVolumeClaimDetailResource': getPersistentVolumeClaimDetailResource,
      'persistentVolumeClaimDetail': getPersistentVolumeClaimDetail,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.objectName}}',
        'parent': persistentVolumeClaimList,
      },
    },
    views: {
      '': {
        controller: PersistentVolumeClaimDetailController,
        controllerAs: '$ctrl',
        templateUrl: 'persistentvolumeclaimdetail/persistentvolumeclaimdetail.html',
      },
      [actionbarViewName]: {
        controller: ActionBarController,
        controllerAs: '$ctrl',
        templateUrl: 'persistentvolumeclaimdetail/actionbar.html',
      },
    },
  });
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.PersistentVolumeClaimDetail>}
 * @ngInject
 */
export function getPersistentVolumeClaimDetailResource($resource, $stateParams) {
  return $resource(
      `api/v1/persistentvolumeclaim/${$stateParams.objectNamespace}/${$stateParams.objectName}`);
}

/**
 * @param {!angular.Resource<!backendApi.PersistentVolumeClaimDetail>} persistentVolumeClaimDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getPersistentVolumeClaimDetail(persistentVolumeClaimDetailResource) {
  return persistentVolumeClaimDetailResource.get().$promise;
}
