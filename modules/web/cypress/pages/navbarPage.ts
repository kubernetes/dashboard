/*
 * Copyright 2017 The Kubernetes Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
  static readonly customresourcedefinitionItemId = '#nav-customresourcedefinition';
  static readonly settingsItemId = '#nav-settings';
}
