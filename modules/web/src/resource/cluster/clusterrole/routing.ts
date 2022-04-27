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
import {DEFAULT_ACTIONBAR} from '@common/components/actionbars/routing';
import {BREADCRUMBS} from '../../../index.messages';

import {CLUSTER_ROUTE} from '../routing';

import {ClusterRoleDetailComponent} from './detail/component';
import {ClusterRoleListComponent} from './list/component';

const CLUSTERROLE_LIST_ROUTE: Route = {
  path: '',
  component: ClusterRoleListComponent,
  data: {
    breadcrumb: BREADCRUMBS.ClusterRoles,
    parent: CLUSTER_ROUTE,
  },
};

const CLUSTERROLE_DETAIL_ROUTE: Route = {
  path: ':resourceName',
  component: ClusterRoleDetailComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: CLUSTERROLE_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([CLUSTERROLE_LIST_ROUTE, CLUSTERROLE_DETAIL_ROUTE, DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class ClusterRoutingModule {}
