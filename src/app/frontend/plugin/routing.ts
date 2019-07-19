import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {PluginListComponent} from './list/component';

export const PLUGIN_ROUTE: Route = {
  path: '',
  component: PluginListComponent,
  data: {
    breadcrumb: 'Plugins',
  }
};

@NgModule({imports: [RouterModule.forChild([PLUGIN_ROUTE])], exports: [RouterModule]})
export class PluginsRoutingModule {
}
