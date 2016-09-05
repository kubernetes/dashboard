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
import eventsModule from 'events/events_module';

import stateConfig from './replicasetdetail_stateconfig';
import {replicaSetInfoComponent} from './replicasetinfo_component';


/**
 * Angular module for the Replica Set details view.
 *
 * The view shows detailed view of a Replica Set.
 */
export default angular
    .module(
        'kubernetesDashboard.replicaSetDetail',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          componentsModule.name,
          chromeModule.name,
          filtersModule.name,
          eventsModule.name,
        ])
    .config(stateConfig)
    .component('kdReplicaSetInfo', replicaSetInfoComponent)
    .factory('kdReplicaSetDetailResource', replicaSetDetailResource)
    .factory('kdReplicaSetPodsResource', replicaSetPodsResource)
    .factory('kdReplicaSetServicesResource', replicaSetServicesResource)
    .factory('kdReplicaSetEventsResource', replicaSetEventsResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function replicaSetDetailResource($resource) {
  return $resource('api/v1/replicaset/:namespace/:name');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function replicaSetPodsResource($resource) {
  return $resource('api/v1/replicaset/:namespace/:name/pod');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function replicaSetServicesResource($resource) {
  return $resource('api/v1/replicaset/:namespace/:name/service');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function replicaSetEventsResource($resource) {
  return $resource('api/v1/replicaset/:namespace/:name/event');
}
