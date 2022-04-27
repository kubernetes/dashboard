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

import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {LOGS_EXEC_DEFAULT_ACTIONBAR} from '@common/components/actionbars/routing';
import {BREADCRUMBS} from '../../../index.messages';

import {WORKLOADS_ROUTE} from '../routing';

import {PodDetailComponent} from './detail/component';
import {PodListComponent} from './list/component';

const POD_LIST_ROUTE: Route = {
  path: '',
  component: PodListComponent,
  data: {
    breadcrumb: BREADCRUMBS.Pods,
    parent: WORKLOADS_ROUTE,
  },
};

export const POD_DETAIL_ROUTE: Route = {
  path: ':resourceNamespace/:resourceName',
  component: PodDetailComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: POD_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([POD_LIST_ROUTE, POD_DETAIL_ROUTE, LOGS_EXEC_DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class PodRoutingModule {}
