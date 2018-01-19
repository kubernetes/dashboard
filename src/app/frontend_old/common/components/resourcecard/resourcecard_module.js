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

import resourceModule from '../../resource/module';

import {logsButtonComponent} from './logsbutton_component';
import {resourceCardComponent} from './resourcecard_component';
import {resourceCardColumnComponent} from './resourcecardcolumn_component';
import {resourceCardColumnsComponent} from './resourcecardcolumns_component';
import {resourceCardDeleteMenuItemComponent} from './resourcecarddeletemenuitem_component';
import {resourceCardEditMenuItemComponent} from './resourcecardeditmenuitem_component';
import {resourceCardFooterComponent} from './resourcecardfooter_component';
import {resourceCardHeaderColumnComponent} from './resourcecardheadercolumn_component';
import {resourceCardHeaderColumnsComponent} from './resourcecardheadercolumns_component';
import {resourceCardListComponent} from './resourcecardlist_component';
import {resourceCardListFilterComponent} from './resourcecardlistfilter_component';
import {resourceCardListFooterComponent} from './resourcecardlistfooter_component';
import {resourceCardListHeaderComponent} from './resourcecardlistheader_component';
import {resourceCardListPaginationComponent} from './resourcecardlistpagination_component';
import {resourceCardMenuComponent} from './resourcecardmenu_component';

/**
 * Module containing common components for resource cards. A resource card should be used
 * for displaying every kind of Kubernetes resource (e.g., Services, Secrets or Replica Sets).
 */
export default angular
    .module(
        'kubernetesDashboard.common.components.resourcecard',
        [
          'ngMaterial',
          'ui.router',
          'angularUtils.directives.dirPagination',
          resourceModule.name,
        ])
    .component('kdLogsButton', logsButtonComponent)
    .component('kdResourceCard', resourceCardComponent)
    .component('kdResourceCardList', resourceCardListComponent)
    .component('kdResourceCardListFooter', resourceCardListFooterComponent)
    .component('kdResourceCardListHeader', resourceCardListHeaderComponent)
    .component('kdResourceCardListFilter', resourceCardListFilterComponent)
    .component('kdResourceCardListPagination', resourceCardListPaginationComponent)
    .component('kdResourceCardMenu', resourceCardMenuComponent)
    .component('kdResourceCardDeleteMenuItem', resourceCardDeleteMenuItemComponent)
    .component('kdResourceCardEditMenuItem', resourceCardEditMenuItemComponent)
    .component('kdResourceCardColumn', resourceCardColumnComponent)
    .component('kdResourceCardColumns', resourceCardColumnsComponent)
    .component('kdResourceCardHeaderColumn', resourceCardHeaderColumnComponent)
    .component('kdResourceCardHeaderColumns', resourceCardHeaderColumnsComponent)
    .component('kdResourceCardFooter', resourceCardFooterComponent);
