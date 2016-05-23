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
import {stateName} from './workloads_state';
import {stateUrl} from './workloads_state';
import {WorkloadsController} from './workloads_controller';
import {WorkloadsActionBarController} from './workloadsactionbar_controller';

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    resolve: {
      'workloads': resolveWorkloads,
    },
    data: {
      'kdBreadcrumbs': {
        'label': 'Workloads',
      },
    },
    views: {
      '': {
        controller: WorkloadsController,
        controllerAs: '$ctrl',
        templateUrl: 'workloads/workloads.html',
      },
      [actionbarViewName]: {
        controller: WorkloadsActionBarController,
        controllerAs: '$ctrl',
        templateUrl: 'workloads/workloadsactionbar.html',
      },
    },
  });
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveWorkloads($resource) {
  /** @type {!angular.Resource<!backendApi.Workloads>} */
  let resource = $resource('api/v1/workload');
  return resource.get().$promise;
}
