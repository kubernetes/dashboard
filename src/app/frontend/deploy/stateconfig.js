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

import {stateName as chromeStateName} from 'chrome/state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';

import DeployController from './controller';
import DeployFromFileController from './deployfromfile_controller';
import DeployFromSettingsController from './deployfromsettings_controller';
import {baseStateName, deployAppStateName, deployFileStateName} from './state';

/**
 * Configures states for the deploy view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(baseStateName, {
    controller: DeployController,
    controllerAs: 'ctrl',
    url: '/deploy',
    parent: chromeStateName,
    abstract: true,
    templateUrl: 'deploy/deploy.html',
  });
  $stateProvider.state(deployAppStateName, {
    controller: DeployFromSettingsController,
    controllerAs: 'ctrl',
    url: '/app',
    parent: baseStateName,
    resolve: {
      'namespaces': resolveNamespaces,
      'protocolsResource': getProtocolsResource,
      'protocols': getDefaultProtocols,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_DEPLOY_APP_LABEL,
      },
    },
    templateUrl: 'deploy/deployfromsettings.html',
  });
  $stateProvider.state(deployFileStateName, {
    controller: DeployFromFileController,
    controllerAs: 'ctrl',
    url: '/file',
    parent: baseStateName,
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_DEPLOY_FILE_LABEL,
      },
    },
    templateUrl: 'deploy/deployfromfile.html',
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

const i18n = {
  /** @type {string} @desc Breadcrum label for the deploy containerized
      app form view. */
  MSG_BREADCRUMBS_DEPLOY_APP_LABEL: goog.getMsg('Create an app'),

  /** @type {string} @desc Breadcrum label for the YAML upload form */
  MSG_BREADCRUMBS_DEPLOY_FILE_LABEL: goog.getMsg('Upload'),
};
