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

import {NetworkPolicyDetailComponent} from './detail/component';
import {NetworkPolicyListComponent} from './list/component';

const NETWORK_POLICY_LIST_ROUTE: Route = {
  path: '',
  component: NetworkPolicyListComponent,
  data: {
    breadcrumb: BREADCRUMBS.NetworkPolicies,
    parent: CLUSTER_ROUTE,
  },
};

const NETWORK_POLICY_DETAIL_ROUTE: Route = {
  path: ':resourceNamespace/:resourceName',
  component: NetworkPolicyDetailComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: NETWORK_POLICY_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([NETWORK_POLICY_LIST_ROUTE, NETWORK_POLICY_DETAIL_ROUTE, DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class NetworkPolicyRoutingModule {}
