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

import {LogsController} from './logs_controller';
import {stateName} from './logs_state';
import LogsToolbarController from './logstoolbar/logstoolbar_controller';
import {toolbarViewName} from '../chrome/chrome_state';

/**
 * Configures states for the logs view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  let views = {
    '': {
      templateUrl: 'logs/logs.html',
      controller: LogsController,
      controllerAs: 'ctrl',
    },
    [toolbarViewName]: {
      templateUrl: 'logs/logstoolbar/logstoolbar.html',
      controller: LogsToolbarController,
      controllerAs: 'ctrl',
    },
  };

  $stateProvider.state(stateName, {
    url: '/log/:namespace/:replicationController/:podId/:container?',
    resolve: {
      'replicationControllerPods': resolveReplicationControllerPods,
      'podLogs': resolvePodLogs,
    },
    views: views,
  });
}

/**
 * @param {!./logs_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveReplicationControllerPods($stateParams, $resource) {
  /** @type {!angular.Resource<!backendApi.ReplicationControllerPods>} */
  let resource = $resource(
      `api/v1/replicationcontroller/pod/${$stateParams.namespace}/${$stateParams.replicationController}`);

  return resource.get().$promise;
}

/**
 * @param {!./logs_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolvePodLogs($stateParams, $resource) {
  /** @type {!angular.Resource<!backendApi.Logs>} */
  let resource = $resource(
      `api/v1/log/${$stateParams.namespace}/${$stateParams.podId}/${$stateParams.container}`);

  return resource.get().$promise;
}
