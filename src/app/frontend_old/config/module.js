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
import configMapModule from '../configmap/module';
import persistentVolumeClaimModule from '../persistentvolumeclaim/module';
import secretModule from '../secret/module';

import stateConfig from './stateconfig';

/**
 * Module for the config category.
 */
export default angular
    .module(
        'kubernetesDashboard.config',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          chromeModule.name,
          configMapModule.name,
          secretModule.name,
          persistentVolumeClaimModule.name,
        ])
    .config(stateConfig)
    .factory('kdConfigResource', resource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function resource($resource) {
  return $resource('api/v1/config/:namespace');
}
