import {AbstractPage} from './abstractPage';

export class NavbarPage extends AbstractPage {
  static readonly clusterItemId = '#nav-cluster';
  static readonly clusterroleItemId = '#nav-clusterrole';
  static readonly namespaceItemId = '#nav-namespace';
  static readonly nodeItemId = '#nav-node';
  static readonly persistentvolumeItemId = '#nav-persistentvolume';
  static readonly storageclassItemId = '#nav-storageclass';
  static readonly overviewItemId = '#nav-overview';
  static readonly namespaceSelectorItemId = '#nav-namespace-selector';
  static readonly workloadsItemId = '#nav-workloads';
  static readonly cronjobItemId = '#nav-cronjob';
  static readonly daemonsetItemId = '#nav-daemonset';
  static readonly deploymentItemId = '#nav-deployment';
  static readonly jobItemId = '#nav-job';
  static readonly podItemId = '#nav-pod';
  static readonly replicasetItemId = '#nav-replicaset';
  static readonly replicationcontrollerItemId = '#nav-replicationcontroller';
  static readonly statefulsetItemId = '#nav-statefulset';
  static readonly discoveryItemId = '#nav-discovery';
  static readonly ingressItemId = '#nav-ingress';
  static readonly serviceItemId = '#nav-service';
  static readonly configItemId = '#nav-config';
  static readonly configmapItemId = '#nav-configmap';
  static readonly persistentvolumeclaimItemId = '#nav-persistentvolumeclaim';
  static readonly secretItemId = '#nav-secret';
  // static readonly pluginItemId = '#nav-plugin';
  static readonly customresourcedefinitionItemId = '#nav-customresourcedefinition';
  static readonly settingsItemId = '#nav-settings';
  static readonly aboutItemId = '#nav-about';
}
