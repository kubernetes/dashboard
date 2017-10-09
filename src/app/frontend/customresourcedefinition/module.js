// Copyright 2017 The Kubernetes Dashboard Authors.
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

import {crdInfoComponent} from './detail/info_component';
import {objectCardComponent} from './detail/objectcard_component';
import {objectListComponent} from './detail/objectlist_component';
import {customResourceDefinitionObjectsResource} from './detail/stateconfig';
import {customResourceDefinitionCardComponent} from './list/card_component';
import {customResourceDefinitionCardListComponent} from './list/cardlist_component';
import {customResourceDefinitionListResource} from './list/stateconfig';
import stateConfig from './stateconfig';

/**
 * Angular module for the Storage Class resource.
 */
export default angular
    .module(
        'kubernetesDashboard.customResourceDefinition',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          chromeModule.name,
          componentsModule.name,
          filtersModule.name,
        ])
    .config(stateConfig)
    .component('kdObjectCard', objectCardComponent)
    .component('kdCustomResourceDefinitionCardList', customResourceDefinitionCardListComponent)
    .component('kdCustomResourceDefinitionCard', customResourceDefinitionCardComponent)
    .component('kdCustomResourceDefinitionInfo', crdInfoComponent)
    .component('kdCustomResourceDefinitionObjects', objectListComponent)
    .factory('kdCustomResourceDefinitionListResource', customResourceDefinitionListResource)
    .factory('kdCustomResourceDefinitionObjectsResource', customResourceDefinitionObjectsResource);
