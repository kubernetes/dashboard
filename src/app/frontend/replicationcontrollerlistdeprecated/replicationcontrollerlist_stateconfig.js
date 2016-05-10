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

import {actionbarViewName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_component';
import {stateName as zerostate} from './zerostate/zerostate_state';
import {stateName as replicationcontrollers} from './replicationcontrollerlist_state';
import {stateUrl as replicationcontrollersUrl} from './replicationcontrollerlist_state';
import {StateParams} from './zerostate/zerostate_state';
import ReplicationControllerListActionBarController from './replicationcontrollerlistactionbar_controller';
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
    url: replicationcontrollersUrl,
    resolve: {
      'replicationControllers': resolveReplicationControllers,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': 'Replication Controllers',
      },
    },
    onEnter: redirectIfNeeded,
    views: {
      '': {
        controller: ReplicationControllerListController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerlistdeprecated/replicationcontrollerlist.html',
      },
      [actionbarViewName]: {
        controller: ReplicationControllerListActionBarController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerlistdeprecated/replicationcontrollerlistactionbar.html',
      },
    },
  });
  $stateProvider.state(zerostate, {
    views: {
      '@': {
        controller: ZeroStateController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerlistdeprecated/zerostate/zerostate.html',
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
  let isEmpty = replicationControllers.replicationControllers.length === 0;
  // should only display RC list if RCs exist that are not in the kube-system namespace,
  // otherwise should redirect to zero state
  let containsOnlyKubeSystemRCs =
      !isEmpty && replicationControllers.replicationControllers.every((rc) => {
        return rc.objectMeta.namespace === 'kube-system';
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
