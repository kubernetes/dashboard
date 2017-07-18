// Copyright 2017 The Kubernetes Dashboard Authors.
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

import chromeModule from 'chrome/module';
import componentsModule from 'common/components/module';
import filtersModule from 'common/filters/module';
import daemonSetModule from 'daemonset/module';
import deploymentModule from 'deployment/module';
import jobModule from 'job/module';
import replicaSetModule from 'replicaset/module';
import replicationControllerModule from 'replicationcontroller/module';
import statefulSetModule from 'statefulset/module';
import ingressModule from 'ingress/module';
import serviceModule from 'service/module';
import configMapModule from 'configmap/module';
import persistentVolumeClaimModule from 'persistentvolumeclaim/module';
import secretModule from 'secret/module';

import stateConfig from './stateconfig';

/**
 * Module with a view that displays all resources categorized as objects, e.g., Workloads and Services.
 */
export default angular
    .module(
        'kubernetesDashboard.allObjects',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          chromeModule.name,
          jobModule.name,
          replicationControllerModule.name,
          replicaSetModule.name,
          deploymentModule.name,
          daemonSetModule.name,
          statefulSetModule.name,
          serviceModule.name,
          ingressModule.name,
          configMapModule.name,
          secretModule.name,
          persistentVolumeClaimModule.name,
        ])
    .config(stateConfig)
    .factory('kdAllObjectsResource', allObjectsResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function allObjectsResource($resource) {
  return $resource('api/v1/allobjects/:namespace');
}
