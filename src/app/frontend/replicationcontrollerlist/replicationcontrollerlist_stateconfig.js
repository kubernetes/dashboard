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

import {stateName as zerostate} from './zerostate/zerostate_state';
import {stateName as replicationcontrollers} from './replicationcontrollerlist_state';
import {stateUrl as replicationcontrollersUrl} from './replicationcontrollerlist_state';
import {StateParams} from './zerostate/zerostate_state';
import ReplicationControllerListController from './replicationcontrollerlist_controller';
import ZeroStateController from './zerostate/zerostate_controller';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(replicationcontrollers, {
    controller: ReplicationControllerListController,
    controllerAs: 'ctrl',
    url: replicationcontrollersUrl,
    resolve: {
      'replicationControllers': resolveReplicationControllers,
    },
    templateUrl: 'replicationcontrollerlist/replicationcontrollerlist.html',
    onEnter: redirectIfNeeded,
  });
  $stateProvider.state(zerostate, {
    views: {
      '@': {
        controller: ZeroStateController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerlist/zerostate/zerostate.html',
      },
    },
    // this is to declare non-url state params
    params: new StateParams(false),
  });
}

/**
 * Avoids entering replication controller list page when there are no replication controllers
 * or when the only replication controllers are in the kube-system namespace.
 * Used f.e. when last replication controller that is not in the kube-system namespace gets
 * deleted.
 * Transition to: zerostate
 * @param {!ui.router.$state} $state
 * @param {!backendApi.ReplicationControllerList} replicationControllers
 * @ngInject
 */
export function redirectIfNeeded($state, replicationControllers) {
  /** @type {boolean} */
  let isEmpty = replicationControllers.namespaces.length === 0;
  // should only display RC list if RCs exist that are not in the kube-system namespace,
  // otherwise should redirect to zero state
  let containsOnlyKubeSystemRCs =
      !isEmpty && replicationControllers.namespaces.every((ns) => {
        return ns.name === 'kube-system';
      });

  if (isEmpty || containsOnlyKubeSystemRCs) {
    let stateParams = new StateParams(containsOnlyKubeSystemRCs);
    $state.transition.then(() => { $state.go(zerostate, stateParams); });
  }
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllers($resource) {
  /** @type {!angular.Resource<!backendApi.ReplicationControllerList>} */
  let resource = $resource('api/v1/replicationcontrollers');
  return resource.get().$promise;
}
