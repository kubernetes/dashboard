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
import chromeModule from 'chrome/chrome_module';
import eventsModule from 'events/events_module';
import resourceModule from 'common/resource/resource_module';
import filtersModule from 'common/filters/filters_module';
import logsModule from 'logs/logs_module';
import podListModule from 'podlist/podlist_module';
import serviceListModule from 'servicelist/servicelist_module';
import stateConfig from './replicationcontrollerdetail_stateconfig';
import {replicationControllerInfoComponent} from './replicationcontrollerinfo_component';
import {ReplicationControllerService} from './replicationcontroller_service';

/**
 * Angular module for the Replication Controller details view.
 *
 * The view shows detailed view of a Replication Controllers.
 */
export default angular
    .module(
        'kubernetesDashboard.replicationControllerDetail',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          componentsModule.name,
          chromeModule.name,
          filtersModule.name,
          logsModule.name,
          podListModule.name,
          serviceListModule.name,
          eventsModule.name,
          resourceModule.name,
        ])
    .config(stateConfig)
    .component('kdReplicationControllerInfo', replicationControllerInfoComponent)
    .service('kdReplicationControllerService', ReplicationControllerService);
