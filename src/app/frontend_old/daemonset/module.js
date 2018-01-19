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
import componentsModule from '../common/components/module';
import filtersModule from '../common/filters/module';
import namespaceModule from '../common/namespace/module';
import eventsModule from '../events/module';

import {daemonSetInfoComponent} from './detail/info_component';
import {daemonSetEventsResource, daemonSetPodsResource, daemonSetServicesResource} from './detail/stateconfig';
import {daemonSetCardComponent} from './list/card_component';
import {daemonSetCardListComponent} from './list/cardlist_component';
import {daemonSetListResource} from './list/stateconfig';
import stateConfig from './stateconfig';

/**
 * Angular module for the Daemon Set resource.
 */
export default angular
    .module(
        'kubernetesDashboard.daemonSet',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          chromeModule.name,
          componentsModule.name,
          eventsModule.name,
          filtersModule.name,
          namespaceModule.name,
        ])
    .config(stateConfig)
    .component('kdDaemonSetCard', daemonSetCardComponent)
    .component('kdDaemonSetCardList', daemonSetCardListComponent)
    .component('kdDaemonSetInfo', daemonSetInfoComponent)
    .factory('kdDaemonSetEventsResource', daemonSetEventsResource)
    .factory('kdDaemonSetListResource', daemonSetListResource)
    .factory('kdDaemonSetPodsResource', daemonSetPodsResource)
    .factory('kdDaemonSetServicesResource', daemonSetServicesResource);
