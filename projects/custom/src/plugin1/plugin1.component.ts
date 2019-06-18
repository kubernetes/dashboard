import {Component, OnInit} from '@angular/core';
import {K8sApiClientService} from "../../../plugin/src/lib/k8s-api-client.service";
import {EndpointManager, Resource} from "../../../../src/app/frontend/common/services/resource/endpoint";

@Component({
  selector: 'app-plugin-1',
  templateUrl: './plugin1.component.html'
})
export class Plugin1Component implements OnInit {
  pods: [];

  constructor(private readonly k8sApiClient: K8sApiClientService) {
  }

  ngOnInit(): void {
    this.getPods();
  }

  getPods() {
    this.k8sApiClient.getPodResourceService()
      .get(EndpointManager.resource(Resource.pod, false).list())
      .subscribe(data => console.log(data));
  }
}
