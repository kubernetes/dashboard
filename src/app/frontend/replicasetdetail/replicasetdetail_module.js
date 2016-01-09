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

import componentsModule from './../common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import serviceEndpointDirective from './serviceendpoint_directive';
import stateConfig from './replicasetdetail_stateconfig';
import sortedHeaderDirective from './sortedheader_directive';
import {DeleteReplicaSetService} from './deletereplicaset_service';

/**
 * Angular module for the Replica Set details view.
 *
 * The view shows detailed view of a Replica Sets.
 */
export default angular.module(
                          'kubernetesDashboard.replicaSetDetail',
                          [
                            'ngMaterial',
                            'ngResource',
                            'ui.router',
                            filtersModule.name,
                            componentsModule.name,
                          ])
    .config(stateConfig)
    .directive('kdServiceEndpoint', serviceEndpointDirective)
    .directive('kdSortedHeader', sortedHeaderDirective)
    .service('kdDeleteReplicaSetService', DeleteReplicaSetService);
