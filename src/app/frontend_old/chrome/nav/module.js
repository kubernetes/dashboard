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


import stateModule from '../../common/state/module';

import {hamburgerComponent} from './hamburger_component';
import {navComponent} from './nav_component';
import {NavService} from './nav_service';
import {navItemComponent} from './navitem_component';
import {roleNavComponent} from './rolenav_component';


/**
 * Angular module containing navigation for the application.
 */
export default angular
    .module(
        'kubernetesDashboard.chrome.nav',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          stateModule.name,
        ])
    .service('kdNavService', NavService)
    .component('kdNavHamburger', hamburgerComponent)
    .component('kdNavItem', navItemComponent)
    .component('kdNav', navComponent)
    .component('kdRoleNav', roleNavComponent);
