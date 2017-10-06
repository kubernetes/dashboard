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

import {basicLoginComponent} from './basic_component';
import {loginComponent} from './component';
import {kubeConfigLoginComponent} from './kubeconfig_component';
import {loginOptionsComponent} from './options_component';
import stateConfig from './stateconfig';
import {authenticationModesResource} from './stateconfig';
import {tokenLoginComponent} from './token_component';

/**
 * Angular module for the Login view.
 */
export default angular
    .module(
        'kubernetesDashboard.login',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          chromeModule.name,
          componentsModule.name,
        ])
    .component('kdLogin', loginComponent)
    .component('kdLoginOptions', loginOptionsComponent)
    .component('kdBasicLogin', basicLoginComponent)
    .component('kdTokenLogin', tokenLoginComponent)
    .component('kdKubeConfigLogin', kubeConfigLoginComponent)
    .factory('kdAuthenticationModesResource', authenticationModesResource)
    .config(stateConfig);
