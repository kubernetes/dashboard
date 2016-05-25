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

import DeployController from './deploy_controller';
import {stateName} from './deploy_state';
import {stateName as chromeStateName} from 'chrome/chrome_state';

/**
 * Configures states for the deploy view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    controller: DeployController,
    controllerAs: 'ctrl',
    url: '/deploy',
    parent: chromeStateName,
    resolve: {
      'namespaces': resolveNamespaces,
      'protocolsResource': getProtocolsResource,
      'protocols': getDefaultProtocols,
    },
    templateUrl: 'deploy/deploy.html',
  });
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveNamespaces($resource) {
  /** @type {!angular.Resource<!backendApi.NamespaceList>} */
  let resource = $resource('api/v1/namespace');

  return resource.get().$promise;
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicationControllerSpec>}
 * @ngInject
 */
function getProtocolsResource($resource) {
  return $resource('api/v1/appdeployment/protocols');
}

/**
 * @param {!angular.Resource<!backendApi.Protocols>} protocolsResource
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
function getDefaultProtocols(protocolsResource) {
  return protocolsResource.get().$promise;
}
