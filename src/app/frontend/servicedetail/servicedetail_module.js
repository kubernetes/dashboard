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

import filtersModule from 'common/filters/filters_module';

import componentsModule from './../common/components/components_module';
import stateConfig from './servicedetail_stateconfig';
import {serviceInfoComponent} from './servicedetailinfo_component';


/**
 * Angular module for the Service details view.
 *
 * The view shows detailed view of a Service.
 */
export default angular
    .module(
        'kubernetesDashboard.serviceDetail',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
        ])
    .config(stateConfig)
    .component('kdServiceInfo', serviceInfoComponent)
    .factory('kdServicePodsResource', servicePodsResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function servicePodsResource($resource) {
  return $resource('api/v1/service/:namespace/:name/pod');
}
