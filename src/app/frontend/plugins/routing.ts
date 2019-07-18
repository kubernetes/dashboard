import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {PluginComponent} from './component';

export const PLUGIN_ROUTE: Route = {
  path: '',
  component: PluginComponent,
  data: {
    breadcrumb: 'Plugins',
  }
};

@NgModule({imports: [RouterModule.forChild([PLUGIN_ROUTE])], exports: [RouterModule]})
export class PluginsRoutingModule {
}
