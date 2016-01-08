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
import {stateName as replicasets} from './replicasetlist_state';
import {stateUrl as replicasetsUrl} from './replicasetlist_state';
import ReplicaSetListController from './replicasetlist_controller';
import ZeroStateController from './zerostate/zerostate_controller';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(replicasets, {
    controller: ReplicaSetListController,
    controllerAs: 'ctrl',
    url: replicasetsUrl,
    resolve: {
      'replicaSets': resolveReplicaSets,
    },
    templateUrl: 'replicasetlist/replicasetlist.html',
    onEnter: redirectIfNeeded,
  });
  $stateProvider.state(zerostate, {
    views: {
      '@': {
        controller: ZeroStateController,
        controllerAs: 'ctrl',
        templateUrl: 'replicasetlist/zerostate/zerostate.html',
      },
    },
    url: '/zerostate',
  });
}

/**
 * Avoids entering replica set list page when there are no replica sets.
 * Used f.e. when last replica set gets deleted.
 * Transition to: zerostate
 * @param {!ui.router.$state} $state
 * @param {!angular.$timeout} $timeout
 * @param {!backendApi.ReplicaSetList} replicaSets
 * @ngInject
 */
function redirectIfNeeded($state, $timeout, replicaSets) {
  if (replicaSets.replicaSets.length === 0) {
    // allow original state change to finish before redirecting to new state to avoid error
    $timeout(() => { $state.go(zerostate); });
  }
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicaSets($resource) {
  /** @type {!angular.Resource<!backendApi.ReplicaSetList>} */
  let resource = $resource('/api/replicasets');

  return resource.get().$promise;
}
