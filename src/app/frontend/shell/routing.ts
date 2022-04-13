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

import {EXEC_PARENT_PLACEHOLDER} from '@common/components/breadcrumbs/component';
import {BREADCRUMBS} from '../index.messages';

import {ShellComponent} from './component';

export const SHELL_ROUTE: Route = {
  path: ':resourceNamespace/:resourceName/:containerName',
  component: ShellComponent,
  data: {
    breadcrumb: BREADCRUMBS.Shell,
    parent: EXEC_PARENT_PLACEHOLDER,
  },
};

export const SHELL_ROUTE_RAW: Route = {
  path: ':resourceNamespace/:resourceName',
  component: ShellComponent,
  data: {
    breadcrumb: BREADCRUMBS.Shell,
    parent: EXEC_PARENT_PLACEHOLDER,
  },
};

@NgModule({
  imports: [RouterModule.forChild([SHELL_ROUTE_RAW, SHELL_ROUTE])],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
