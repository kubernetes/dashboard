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
import {
  stateName as replicationControllers,
} from 'replicationcontrollerlist/replicationcontrollerlist_state';

import {stateName} from './replicationcontrollerdetail_state';
import {
  ReplicationControllerDetailActionBarController,
} from './replicationcontrollerdetailactionbar_controller';

import ReplicationControllerDetailController from './replicationcontrollerdetail_controller';
import {appendDetailParamsToUrl} from 'common/resource/resourcedetail';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: appendDetailParamsToUrl('/replicationcontroller'),
    parent: chromeStateName,
    resolve: {
      'replicationControllerSpecPodsResource': getReplicationControllerSpecPodsResource,
      'replicationControllerDetailResource': getReplicationControllerDetailsResource,
      'replicationControllerDetail': resolveReplicationControllerDetails,
      'replicationControllerEvents': resolveReplicationControllerEvents,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.objectName}}',
        'parent': replicationControllers,
      },
    },
    views: {
      '': {
        controller: ReplicationControllerDetailController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerdetail/replicationcontrollerdetail.html',
      },
      [actionbarViewName]: {
        controller: ReplicationControllerDetailActionBarController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerdetail/replicationcontrollerdetailactionbar.html',
      },
    },
  });
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerDetail>}
 * @ngInject
 */
export function getReplicationControllerDetailsResource($stateParams, $resource) {
  return $resource(`api/v1/replicationcontroller/${$stateParams.objectNamespace}/` +
                   `${$stateParams.objectName}`);
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerSpec>}
 * @ngInject
 */
export function getReplicationControllerSpecPodsResource($stateParams, $resource) {
  return $resource(`api/v1/replicationcontroller/${$stateParams.objectNamespace}/` +
                   `${$stateParams.objectName}/update/pod`);
}

/**
 * @param {!angular.Resource<!backendApi.ReplicationControllerDetail>}
 * replicationControllerDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerDetails(replicationControllerDetailResource) {
  return replicationControllerDetailResource.get().$promise;
}

/**
 * @param {!./../common/resource/resourcedetail.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerEvents($stateParams, $resource) {
  /** @type {!angular.Resource<!backendApi.Events>} */
  let resource =
      $resource(`api/v1/event/${$stateParams.objectNamespace}/${$stateParams.objectName}`);

  return resource.get().$promise;
}
