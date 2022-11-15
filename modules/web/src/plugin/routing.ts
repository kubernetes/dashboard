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
import {BREADCRUMBS} from '../index.messages';
import {PluginListComponent} from './list/component';
import {PluginDetailComponent} from './detail/component';

export const PLUGIN_LIST_ROUTE: Route = {
  path: '',
  component: PluginListComponent,
  data: {
    breadcrumb: BREADCRUMBS.Plugins,
  },
};

export const PLUGIN_DETAIL_ROUTE: Route = {
  path: ':pluginNamespace/:pluginName',
  component: PluginDetailComponent,
  data: {
    breadcrumb: '{{ pluginName }}',
    parent: PLUGIN_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([PLUGIN_LIST_ROUTE, PLUGIN_DETAIL_ROUTE])],
  exports: [RouterModule],
})
export class PluginsRoutingModule {}
