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
import {stateName as workloadsState} from 'workloads/workloads_state';

import {DeploymentListController} from './deploymentlist_controller';
import {stateName, stateUrl} from './deploymentlist_state';
import {DeploymentListActionBarController} from './deploymentlistactionbar_controller';


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
      'deployments': resolveDeployments,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': 'Deployments',
        'parent': workloadsState,
      },
    },
    views: {
      '': {
        controller: DeploymentListController,
        controllerAs: '$ctrl',
        templateUrl: 'deploymentlist/deploymentlist.html',
      },
      [actionbarViewName]: {
        controller: DeploymentListActionBarController,
        controllerAs: 'ctrl',
        templateUrl: 'deploymentlist/deploymentlistactionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveDeployments($resource) {
  /** @type {!angular.Resource<!backendApi.DeploymentList>} */
  let resource = $resource('api/v1/deployment');
  return resource.get().$promise;
}
