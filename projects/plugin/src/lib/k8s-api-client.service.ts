import {Injectable} from "@angular/core";
import {
  NamespacedResourceService,
} from "./resource";
import {
  ClusterRoleList,
  ConfigMapList,
  CronJobList,
  DaemonSetList,
  DeploymentList,
  EventList,
  IngressList,
  NamespaceList,
  NodeList,
  PersistentVolumeClaimList,
  PersistentVolumeList,
  PodList,
  ReplicaSetList,
  ReplicationControllerList,
  SecretList,
  ServiceList,
  StatefulSetList,
  StorageClassList,
} from "./typings/backendapi";

@Injectable({
  providedIn: 'root',
})
export class K8sApiClientService {
  constructor(
    private readonly cronJobResourceService_: NamespacedResourceService<CronJobList>,
    private readonly daemonSetResourceService_: NamespacedResourceService<DaemonSetList>,
    private readonly deploymentResourceService_: NamespacedResourceService<DeploymentList>,
    private readonly podResourceService_: NamespacedResourceService<PodList>,
    private readonly replicaSetResourceService_: NamespacedResourceService<ReplicaSetList>,
    private readonly replicationControllerResourceService_: NamespacedResourceService<ReplicationControllerList>,
    private readonly statefulSetResourceService_: NamespacedResourceService<StatefulSetList>,
    private readonly nodeResourceService_: NamespacedResourceService<NodeList>,
    private readonly namespaceResourceService_: NamespacedResourceService<NamespaceList>,
    private readonly persistentVolumeResourceService_: NamespacedResourceService<PersistentVolumeList>,
    private readonly storageClassResourceService_: NamespacedResourceService<StorageClassList>,
    private readonly clusterRoleResourceService_: NamespacedResourceService<ClusterRoleList>,
    private readonly configMapResourceService_: NamespacedResourceService<ConfigMapList>,
    private readonly persistentVolumeClaimResourceService_: NamespacedResourceService<PersistentVolumeClaimList>,
    private readonly secretResourceService_: NamespacedResourceService<SecretList>,
    private readonly ingressResourceService_: NamespacedResourceService<IngressList>,
    private readonly serviceResourceService_: NamespacedResourceService<ServiceList>,
    private readonly eventResourceService_: NamespacedResourceService<EventList>,
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

  getReplicaSetResourceService(): NamespacedResourceService<ReplicaSetList> {
    return this.replicaSetResourceService_;
  }

  getReplicationControllerResourceService(): NamespacedResourceService<ReplicationControllerList> {
    return this.replicationControllerResourceService_;
  }

  getStatefulSetResourceService(): NamespacedResourceService<StatefulSetList> {
    return this.statefulSetResourceService_;
  }

  getNodeResourceService(): NamespacedResourceService<NodeList> {
    return this.nodeResourceService_;
  }

  getNamespaceResourceService(): NamespacedResourceService<NamespaceList> {
    return this.namespaceResourceService_;
  }

  getPersistentVolumeResourceService(): NamespacedResourceService<PersistentVolumeList> {
    return this.persistentVolumeResourceService_;
  }

  getStorageClassResourceService(): NamespacedResourceService<StorageClassList> {
    return this.storageClassResourceService_;
  }

  getClusterRoleResourceService(): NamespacedResourceService<ClusterRoleList> {
    return this.clusterRoleResourceService_;
  }

  getConfigMapResourceService(): NamespacedResourceService<ConfigMapList> {
    return this.configMapResourceService_;
  }

  getPersistentVolumeClaimResourceService(): NamespacedResourceService<PersistentVolumeClaimList> {
    return this.persistentVolumeClaimResourceService_;
  }

  getSecretResourceService(): NamespacedResourceService<SecretList> {
    return this.secretResourceService_;
  }

  getIngressResourceService(): NamespacedResourceService<IngressList> {
    return this.ingressResourceService_;
  }

  getServiceResourceService(): NamespacedResourceService<ServiceList> {
    return this.serviceResourceService_;
  }

  getEventResourceService(): NamespacedResourceService<EventList> {
    return this.eventResourceService_;
  }
}
