import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {ExtPageComponent} from './component';

export const SETTINGS_ROUTE: Route = {
  path: '',
  component: ExtPageComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
  },
};

@NgModule({
  imports: [RouterModule.forChild([SETTINGS_ROUTE])],
  exports: [RouterModule],
})
export class ExtPageRoutingModule {}
