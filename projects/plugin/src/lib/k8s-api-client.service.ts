import {Injectable} from "@angular/core";
import {
  NamespacedResourceService
} from "./resource";
import {CronJobList, DaemonSetList, DeploymentList, PodList} from "./typings/backendapi";

@Injectable({
  providedIn: 'root',
})
export class K8sApiClientService {
  constructor(
    private readonly cronJobResourceService_: NamespacedResourceService<CronJobList>,
    private readonly daemonSetResourceService_: NamespacedResourceService<DaemonSetList>,
    private readonly deploymentResourceService_: NamespacedResourceService<DeploymentList>,
    private readonly podResourceService_: NamespacedResourceService<PodList>,
  ) {
  }

  getCronJobResourceService(): NamespacedResourceService<CronJobList> {
    return this.cronJobResourceService_;
  }

  getDaemonSetResourceService(): NamespacedResourceService<DaemonSetList> {
    return this.daemonSetResourceService_;
  }

  getDeploymentResourceService(): NamespacedResourceService<DeploymentList> {
    return this.deploymentResourceService_;
  }

  getPodResourceService(): NamespacedResourceService<PodList> {
    return this.podResourceService_;
  }
}
