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
import namespaceModule from '../namespace/module';
import nodeModule from '../node/module';
import persistentVolumeModule from '../persistentvolume/module';
import roleModule from '../role/module';
import storageClassModule from '../storageclass/module';

import stateConfig from './stateconfig';

/**
 * Module for the cluster view.
 */
export default angular
    .module(
        'kubernetesDashboard.cluster',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          chromeModule.name,
          nodeModule.name,
          namespaceModule.name,
          persistentVolumeModule.name,
          roleModule.name,
          storageClassModule.name,
        ])
    .config(stateConfig)
    .factory('kdClusterResource', resource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function resource($resource) {
  return $resource('api/v1/cluster');
}
