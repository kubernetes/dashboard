import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginModule} from 'k8s-plugin';
import {Plugin1Component} from "./plugin1.component";
import {HttpClientModule} from "@angular/common/http";
import {NamespacedResourceService} from "k8s-plugin";
import {NamespacedResourceService as CNRS} from "../../../../src/app/frontend/common/services/resource/resource";
import {NamespaceService} from "../../../../src/app/frontend/common/services/global/namespace";

@NgModule({
  imports: [CommonModule, HttpClientModule, PluginModule],
  declarations: [Plugin1Component],
  entryComponents: [Plugin1Component],
  providers: [{provide: NamespacedResourceService, useClass: CNRS}, NamespaceService]
})
export class Plugin1Module {
  static entry = Plugin1Component;
}
