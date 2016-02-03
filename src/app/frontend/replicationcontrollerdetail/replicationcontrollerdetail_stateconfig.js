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

import ReplicationControllerDetailController from './replicationcontrollerdetail_controller';
import {stateName} from './replicationcontrollerdetail_state';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    controller: ReplicationControllerDetailController,
    controllerAs: 'ctrl',
    url: '/replicationcontrollers/:namespace/:replicationController',
    templateUrl: 'replicationcontrollerdetail/replicationcontrollerdetail.html',
    resolve: {
      'replicationControllerSpecPodsResource': getReplicationControllerSpecPodsResource,
      'replicationControllerDetailResource': getReplicationControllerDetailsResource,
      'replicationControllerDetail': resolveReplicationControllerDetails,
      'replicationControllerEvents': resolveReplicationControllerEvents,
    },
  });
}

/**
 * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerDetail>}
 * @ngInject
 */
export function getReplicationControllerDetailsResource($stateParams, $resource) {
  return $resource(
      `api/replicationcontrollers/${$stateParams.namespace}/${$stateParams.replicationController}`);
}

/**
 * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerSpec>}
 * @ngInject
 */
export function getReplicationControllerSpecPodsResource($stateParams, $resource) {
  return $resource(`api/replicationcontrollers/${$stateParams.namespace}/${$stateParams.replicationController}/update/pods`);
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
 * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerEvents($stateParams, $resource) {
  /** @type {!angular.Resource<!backendApi.Events>} */
  let resource =
      $resource(`api/events/${$stateParams.namespace}/${$stateParams.replicationController}`);

  return resource.get().$promise;
}
