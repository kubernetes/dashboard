// Copyright 2017 The Kubernetes Authors.
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

import chromeModule from '../chrome/module';
import componentsModule from '../common/components/module';
import filtersModule from '../common/filters/module';
import configMapModule from '../configmap/module';
import cronJobModule from '../cronjob/module';
import daemonSetModule from '../daemonset/module';
import deploymentModule from '../deployment/module';
import ingressModule from '../ingress/module';
import jobModule from '../job/module';
import persistentVolumeClaimModule from '../persistentvolumeclaim/module';
import replicaSetModule from '../replicaset/module';
import replicationControllerModule from '../replicationcontroller/module';
import secretModule from '../secret/module';
import serviceModule from '../service/module';
import statefulSetModule from '../statefulset/module';

import stateConfig from './stateconfig';
import {workloadStatusesComponent} from './workloadstatuses/component';

/**
 * Module with a view that displays all resources categorized as objects
 * e.g., Workloads and Services.
 */
export default angular
    .module(
        'kubernetesDashboard.overview',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          chromeModule.name,
          jobModule.name,
          cronJobModule.name,
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
    .factory('kdOverviewResource', overviewResource)
    .component('kdWorkloadStatuses', workloadStatusesComponent);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function overviewResource($resource) {
  return $resource('api/v1/overview/:namespace');
}
