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
import {stateName as workloadsState} from 'workloads/workloads_state';
import {redirectToZerostate} from 'zerostate/zerostate_stateconfig';

import {ReplicaSetListController} from './replicasetlist_controller';
import {stateName, stateUrl} from './replicasetlist_state';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    resolve: {
      'replicaSets': resolveReplicaSets,
    },
    'onEnter': redirectIfNeeded,
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_REPLICA_SETS_LABEL,
        'parent': workloadsState,
      },
    },
    views: {
      '': {
        controller: ReplicaSetListController,
        controllerAs: '$ctrl',
        templateUrl: 'replicasetlist/replicasetlist.html',
      },
      [actionbarViewName]: {
        templateUrl: 'replicasetlist/actionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveReplicaSets($resource, $stateParams) {
  /** @type {!angular.Resource<!backendApi.ReplicaSetList>} */
  let resource = $resource(`api/v1/replicaset/${$stateParams.namespace || ''}`);
  return resource.get().$promise;
}

/**
 * @param {!backendApi.ReplicaSetList} replicaSets
 * @param {!ui.router.$state} $state
 * @param {!angular.$timeout} $timeout
 * @ngInject
 */
function redirectIfNeeded(replicaSets, $state, $timeout) {
  redirectToZerostate(replicaSets.replicaSets, $state, stateName, $timeout);
}

const i18n = {
  /** @type {string} @desc Label 'Replica Sets' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_REPLICA_SETS_LABEL: goog.getMsg('Replica Sets'),
};
