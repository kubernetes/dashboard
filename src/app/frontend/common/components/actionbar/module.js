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

import resourceModule from 'common/resource/module';

import {breadcrumbsComponent} from './../breadcrumbs/component';
import {BreadcrumbsService} from './../breadcrumbs/service';
import {actionbarDeleteItemComponent} from './actionbardeleteitem_component';
import {actionbarDetailButtonsComponent} from './actionbardetailbuttons_component';
import {actionbarEditItemComponent} from './actionbaredititem_component';
import {actionbarListButtonsComponent} from './actionbarlistbuttons_component';
import {actionbarComponent} from './component';


/**
 * Module containing common actionbar.
 */
export default angular
    .module(
        'kubernetesDashboard.common.components.actionbar',
        [
          'ngMaterial',
          'ui.router',
          resourceModule.name,
        ])
    .component('kdActionbar', actionbarComponent)
    .component('kdBreadcrumbs', breadcrumbsComponent)
    .component('kdActionbarDeleteItem', actionbarDeleteItemComponent)
    .component('kdActionbarEditItem', actionbarEditItemComponent)
    .component('kdActionbarDetailButtons', actionbarDetailButtonsComponent)
    .component('kdActionbarListButtons', actionbarListButtonsComponent)
    .service('kdBreadcrumbsService', BreadcrumbsService);
