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
import {ReplicationControllerListController} from './replicationcontrollerlist_controller';
import {stateName, stateUrl} from './replicationcontrollerlist_state';
import ReplicationControllerListActionBarController from './replicationcontrollerlistactionbar_controller';

/**
 * Configures states for the service view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    resolve: {
      'replicationControllers': resolveReplicationControllers,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': 'Replication Controllers',
      },
    },
    views: {
      '': {
        controller: ReplicationControllerListController,
        controllerAs: '$ctrl',
        templateUrl: 'replicationcontrollerlist/replicationcontrollerlist.html',
      },
      [actionbarViewName]: {
        controller: ReplicationControllerListActionBarController,
        controllerAs: 'ctrl',
        templateUrl: 'replicationcontrollerlist/replicationcontrollerlistactionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveReplicationControllers($resource) {
  /** @type {!angular.Resource<!backendApi.ReplicationControllerList>} */
  let resource = $resource('api/v1/replicationcontrollers');
  return resource.get().$promise;
}
