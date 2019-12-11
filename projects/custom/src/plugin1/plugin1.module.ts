import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginModule} from 'k8s-plugin';
import {Plugin1Component} from "./plugin1.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NamespacedResourceService} from "k8s-plugin";
import {NamespacedResourceService as CNRS} from "../../../../src/app/frontend/common/services/resource/resource";
import {NamespaceService} from "../../../../src/app/frontend/common/services/global/namespace";
import {AuthInterceptor} from '../../../../src/app/frontend/common/services/global/interceptor';
import {GlobalSettingsService} from "../../../../src/app/frontend/common/services/global/globalsettings";
import {AuthorizerService} from "../../../../src/app/frontend/common/services/global/authorizer";

@NgModule({
  imports: [CommonModule, HttpClientModule, PluginModule],
  declarations: [Plugin1Component],
  entryComponents: [Plugin1Component],
  providers: [
    {provide: NamespacedResourceService, useClass: CNRS},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    NamespaceService,
    GlobalSettingsService,
    AuthorizerService
  ],
})
export class Plugin1Module {
  static entry = Plugin1Component;
}
