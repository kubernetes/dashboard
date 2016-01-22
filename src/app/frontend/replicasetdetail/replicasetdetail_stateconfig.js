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

import ReplicaSetDetailController from './replicasetdetail_controller';
import {stateName} from './replicasetdetail_state';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    controller: ReplicaSetDetailController,
    controllerAs: 'ctrl',
    url: '/replicasets/:namespace/:replicaSet',
    templateUrl: 'replicasetdetail/replicasetdetail.html',
    resolve: {
      'replicaSetSpecPodsResource': getReplicaSetSpecPodsResource,
      'replicaSetDetailResource': getReplicaSetDetailsResource,
      'replicaSetDetail': resolveReplicaSetDetails,
      'replicaSetEvents': resolveReplicaSetEvents,
    },
  });
}

/**
 * @param {!./replicasetdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicaSetDetail>}
 * @ngInject
 */
export function getReplicaSetDetailsResource($stateParams, $resource) {
  return $resource(`api/replicasets/${$stateParams.namespace}/${$stateParams.replicaSet}`);
}

/**
 * @param {!./replicasetdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicaSetSpec>}
 * @ngInject
 */
export function getReplicaSetSpecPodsResource($stateParams, $resource) {
  return $resource(`api/replicasets/${$stateParams.namespace}/${$stateParams.replicaSet}/update/pods`);
}

/**
 * @param {!angular.Resource<!backendApi.ReplicaSetDetail>} replicaSetDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicaSetDetails(replicaSetDetailResource) {
  return replicaSetDetailResource.get().$promise;
}

/**
 * @param {!./replicasetdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicaSetEvents($stateParams, $resource) {
  /** @type {!angular.Resource<!backendApi.Events>} */
  let resource = $resource(`api/events/${$stateParams.namespace}/${$stateParams.replicaSet}`);

  return resource.get().$promise;
}
