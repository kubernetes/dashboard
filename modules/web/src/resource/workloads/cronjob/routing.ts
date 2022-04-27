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
import {TRIGGER_DEFAULT_ACTIONBAR} from '@common/components/actionbars/routing';
import {BREADCRUMBS} from '../../../index.messages';

import {WORKLOADS_ROUTE} from '../routing';

import {CronJobDetailComponent} from './detail/component';
import {CronJobListComponent} from './list/component';

const CRONJOB_LIST_ROUTE: Route = {
  path: '',
  component: CronJobListComponent,
  data: {
    breadcrumb: BREADCRUMBS.CronJobs,
    parent: WORKLOADS_ROUTE,
  },
};

const CRONJOB_DETAIL_ROUTE: Route = {
  path: ':resourceNamespace/:resourceName',
  component: CronJobDetailComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: CRONJOB_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([CRONJOB_LIST_ROUTE, CRONJOB_DETAIL_ROUTE, TRIGGER_DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class CronJobRoutingModule {}
