import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {PluginListComponent} from './list/component';
import {PluginHolderComponent} from "./detail/component";

export const PLUGIN_ROUTE: Route = {
  path: '',
  component: PluginListComponent,
  data: {
    breadcrumb: 'Plugins',
  }
};

export const PLUGIN_HOLDER_ROUTE: Route = {
  path: ':pluginNamespace/:pluginName',
  component: PluginHolderComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: PLUGIN_ROUTE,
  },
};

@NgModule({imports: [RouterModule.forChild([PLUGIN_ROUTE, PLUGIN_HOLDER_ROUTE])], exports: [RouterModule]})
export class PluginsRoutingModule {
}
