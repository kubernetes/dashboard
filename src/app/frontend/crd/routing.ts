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

import {CRDDetailComponent} from './detail/component';
import {CRDListComponent} from './list/component';
import {DEFAULT_ACTIONBAR} from '../common/components/actionbars/routing';
import {CRDObjectDetailComponent} from './crdobject/component';

const CRD_LIST_ROUTE: Route = {
  path: '',
  component: CRDListComponent,
  data: {breadcrumb: 'Custom Resource Definitions'},
};

const CRD_DETAIL_ROUTE: Route = {
  path: ':crdName',
  component: CRDDetailComponent,
  data: {breadcrumb: '{{ crdName }}', parent: CRD_LIST_ROUTE},
};

const CRD_NAMESPACED_OBJECT_DETAIL_ROUTE: Route = {
  path: ':crdName/:namespace/:objectName',
  component: CRDObjectDetailComponent,
  data: {breadcrumb: '{{ objectName }}', routeParamsCount: 2, parent: CRD_DETAIL_ROUTE},
};

const CRD_CLUSTER_OBJECT_DETAIL_ROUTE: Route = {
  path: ':crdName/:objectName',
  component: CRDObjectDetailComponent,
  data: {breadcrumb: '{{ objectName }}', routeParamsCount: 1, parent: CRD_DETAIL_ROUTE},
};

@NgModule({
  imports: [
    RouterModule.forChild([
      CRD_LIST_ROUTE,
      CRD_DETAIL_ROUTE,
      CRD_NAMESPACED_OBJECT_DETAIL_ROUTE,
      CRD_CLUSTER_OBJECT_DETAIL_ROUTE,
      DEFAULT_ACTIONBAR,
    ]),
  ],
})
export class CRDRoutingModule {}
