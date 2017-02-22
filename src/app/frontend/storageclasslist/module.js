// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import storageClassDetailModule from 'storageclassdetail/module';

import {storageClassCardComponent} from './card_component';
import {storageClassCardListComponent} from './cardlist_component';
import stateConfig from './stateconfig';


/**
 * Angular module for the Storage Class list view.
 */
export default angular
    .module(
        'kubernetesDashboard.storageClassList',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          storageClassDetailModule.name,
          chromeModule.name,
        ])
    .config(stateConfig)
    .component('kdStorageClassCardList', storageClassCardListComponent)
    .component('kdStorageClassCard', storageClassCardComponent)
    .factory('kdStorageClassListResource', storageClassListResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function storageClassListResource($resource) {
  return $resource('api/v1/storageclass');
}
