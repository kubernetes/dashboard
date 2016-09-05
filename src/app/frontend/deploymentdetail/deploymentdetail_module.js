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

import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';

import stateConfig from './deploymentdetail_stateconfig';
import {deploymentInfoComponent} from './deploymentinfo_component';


/**
 * Angular module for the Deployment details view.
 *
 * The view shows detailed view of a Deployment.
 */
export default angular
    .module(
        'kubernetesDashboard.deploymentdetail',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          componentsModule.name,
          filtersModule.name,
        ])
    .config(stateConfig)
    .component('kdDeploymentInfo', deploymentInfoComponent)
    .factory('kdDeploymentEventsResource', deploymentEventsResource)
    .factory('kdDeploymentOldReplicaSetsResource', deploymentOldReplicaSetsResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function deploymentEventsResource($resource) {
  return $resource('api/v1/deployment/:namespace/:name/event');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function deploymentOldReplicaSetsResource($resource) {
  return $resource('api/v1/deployment/:namespace/:name/oldreplicaset');
}
