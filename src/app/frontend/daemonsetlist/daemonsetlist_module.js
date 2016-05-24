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
import stateConfig from './daemonsetlist_stateconfig';
import {daemonSetCardListComponent} from './daemonsetlist_component';
import daemonSetDetailModule from 'daemonsetdetail/daemonsetdetail_module';

/**
 * Angular module for the Daemon Set list view.
 *
 * The view shows Daemon Set running in the cluster and allows to manage them.
 */
export default angular
    .module(
        'kubernetesDashboard.daemonSetList',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
            daemonSetDetailModule.name,

        ])
    .config(stateConfig)
    .component('kdDaemonSetCardList', daemonSetCardListComponent);
