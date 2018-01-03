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

import componentsModule from '../common/components/module';
import namespaceModule from '../common/namespace/module';

import {chromeComponent} from './component';
import {controlPanelComponent} from './controlpanel/component';
import navModule from './nav/module';
import {searchComponent} from './search/component';
import stateConfig from './stateconfig';

/**
 * Angular module containing navigation chrome for the application.
 */
export default angular
    .module(
        'kubernetesDashboard.chrome',
        [
          'ngMaterial',
          'ui.router',
          componentsModule.name,
          namespaceModule.name,
          navModule.name,
        ])
    .config(stateConfig)
    .component('kdChrome', chromeComponent)
    .component('kdControlPanel', controlPanelComponent)
    .component('kdSearch', searchComponent);
