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

import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import daemonSetListModule from 'daemonsetlist/daemonsetlist_module';
import deploymentListModule from 'deploymentlist/deploymentlist_module';
import horizontalPodAutoscalerListModule from 'horizontalpodautoscalerlist/horizontalpodautoscalerlist_module';
import jobListModule from 'joblist/joblist_module';
import replicaSetListModule from 'replicasetlist/replicasetlist_module';
import replicationControllerListModule from 'replicationcontrollerlist/replicationcontrollerlist_module';
import statefulSetListModule from 'statefulsetlist/statefulsetlist_module';

import stateConfig from './workloads_stateconfig';


/**
 * Module with a view that displays resources categorized as workloads, e.g., Replica Sets or
 * Deployments.
 */
export default angular
    .module(
        'kubernetesDashboard.workloads',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          chromeModule.name,
          jobListModule.name,
          replicationControllerListModule.name,
          replicaSetListModule.name,
          deploymentListModule.name,
          daemonSetListModule.name,
          horizontalPodAutoscalerListModule.name,
          statefulSetListModule.name,
        ])
    .config(stateConfig)
    .factory('kdWorkloadResource', workloadResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function workloadResource($resource) {
  return $resource('api/v1/workload/:namespace');
}
