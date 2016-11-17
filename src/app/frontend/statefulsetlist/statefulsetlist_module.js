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
import namespaceModule from 'common/namespace/namespace_module';
import statefulSetDetailModule from 'statefulsetdetail/statefulsetdetail_module';

import {statefulSetCardComponent} from './statefulsetcard_component';
import {statefulSetCardListComponent} from './statefulsetcardlist_component';
import stateConfig from './statefulsetlist_stateconfig';


/**
 * Angular module for the Stateful Set list view.
 *
 * The view shows Stateful Set running in the cluster and allows to manage them.
 */
export default angular
    .module(
        'kubernetesDashboard.statefulSetList',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          namespaceModule.name,
          statefulSetDetailModule.name,
          chromeModule.name,
        ])
    .config(stateConfig)
    .component('kdStatefulSetCardList', statefulSetCardListComponent)
    .component('kdStatefulSetCard', statefulSetCardComponent)
    .factory('kdStatefulSetListResource', statefulSetListResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function statefulSetListResource($resource) {
  return $resource('api/v1/statefulset/:namespace');
}
