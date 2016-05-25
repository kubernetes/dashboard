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
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';
import {ReplicaSetListController} from './replicasetlist_controller';
import {stateName, stateUrl} from './replicasetlist_state';
import {stateName as workloadsState} from 'workloads/workloads_state';
import {stateName as namespaceStateName} from 'common/namespace/namespace_state';
import ReplicaSetListActionBarController from './replicasetlistactionbar_controller';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: namespaceStateName,
    resolve: {
      'replicaSets': resolveReplicaSets,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': 'Replica Sets',
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
        controller: ReplicaSetListActionBarController,
        controllerAs: 'ctrl',
        templateUrl: 'replicasetlist/replicasetlistactionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @param {!./../common/namespace/namespace_state.StateParams} $stateParams
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveReplicaSets($resource, $stateParams) {
  /** @type {!angular.Resource<!backendApi.ReplicaSetList>} */
  let resource = $resource(`api/v1/replicaset/${$stateParams.namespace || ''}`);
  return resource.get().$promise;
}
