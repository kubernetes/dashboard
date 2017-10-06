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

import {nodeAllocatedResourcesComponent} from './detail/allocatedresources_component';
import {nodeInfoComponent} from './detail/info_component';
import {nodeEventsResource, nodePodsResource} from './detail/stateconfig';
import {nodeCardComponent} from './list/card_component';
import {nodeCardListComponent} from './list/cardlist_component';
import {nodeListResource} from './list/stateconfig';
import stateConfig from './stateconfig';

/**
 * Angular module for the Node resource.
 */
export default angular
    .module(
        'kubernetesDashboard.node',
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
    .component('kdNodeAllocatedResources', nodeAllocatedResourcesComponent)
    .component('kdNodeCard', nodeCardComponent)
    .component('kdNodeCardList', nodeCardListComponent)
    .component('kdNodeInfo', nodeInfoComponent)
    .factory('kdNodeEventsResource', nodeEventsResource)
    .factory('kdNodeListResource', nodeListResource)
    .factory('kdNodePodsResource', nodePodsResource);
