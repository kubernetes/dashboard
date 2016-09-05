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
import namespaceModule from 'common/namespace/namespace_module';
import paginationModule from 'common/pagination/pagination_module';
import replicaSetDetailModule from 'replicasetdetail/replicasetdetail_module';

import {replicaSetCardComponent} from './replicasetcard_component';
import {replicaSetCardListComponent} from './replicasetcardlist_component';
import stateConfig from './replicasetlist_stateconfig';


/**
 * Angular module for the Replica Set list view.
 *
 * The view shows Replica Set running in the cluster and allows to manage them.
 */
export default angular
    .module(
        'kubernetesDashboard.replicaSetList',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          namespaceModule.name,
          replicaSetDetailModule.name,
          paginationModule.name,
        ])
    .config(stateConfig)
    .component('kdReplicaSetCardList', replicaSetCardListComponent)
    .component('kdReplicaSetCard', replicaSetCardComponent)
    .factory('kdReplicaSetListResource', replicaSetListResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function replicaSetListResource($resource) {
  return $resource('api/v1/replicaset/:namespace');
}
