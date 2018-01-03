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

import {roleCardComponent} from './list/card_component';
import {roleCardListComponent} from './list/cardlist_component';
import {roleListResource} from './list/stateconfig';
import stateConfig from './stateconfig';

/**
 * Angular module for the Role list view.
 */
export default angular
    .module(
        'kubernetesDashboard.role',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          filtersModule.name,
          componentsModule.name,
          chromeModule.name,
        ])
    .config(stateConfig)
    .component('kdRoleCardList', roleCardListComponent)
    .component('kdRoleCard', roleCardComponent)
    .factory('kdRoleListResource', roleListResource);
