import {NgModule} from '@angular/core';
import {AuthGuard} from './authguard';

@NgModule({
  providers: [AuthGuard],
})
export class GuardsModule {
}