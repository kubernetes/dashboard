import {Injectable} from "@angular/core";
import {
  NamespacedResourceService
} from "./resource";
import {PodList} from "./backendapi";

@Injectable({
  providedIn: 'root',
})
export class K8sApiClientService {
  constructor(private readonly podResources: NamespacedResourceService<PodList>) {
  }

  getPodResources(): NamespacedResourceService<PodList> { return this.podResources; }
}
