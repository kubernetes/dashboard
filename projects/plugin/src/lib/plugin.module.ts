import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {K8sApiClientService} from "./k8s-api-client.service";

@NgModule({
  imports: [CommonModule],
  providers: [K8sApiClientService],
})
export class PluginModule {
}
