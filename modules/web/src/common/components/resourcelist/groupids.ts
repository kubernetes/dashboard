// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export enum ListIdentifier {
  clusterRole = 'clusterRoleList',
  clusterRoleBinding = 'clusterRoleBindingList',
  role = 'roleList',
  roleBinding = 'roleBindingList',
  namespace = 'namespaceList',
  node = 'nodeList',
  persistentVolume = 'persistentVolumeList',
  storageClass = 'storageClassList',
  ingressClass = 'ingressClassList',
  cronJob = 'cronJobList',
  crd = 'crdList',
  crdObject = 'crdObjectList',
  job = 'jobList',
  deployment = 'deploymentList',
  daemonSet = 'daemonSetList',
  pod = 'podList',
  horizontalpodautoscaler = 'horizontalPodAutoscalerList',
  replicaSet = 'replicaSetList',
  ingress = 'ingressList',
  service = 'serviceList',
  serviceAccount = 'serviceAccountList',
  networkPolicy = 'networkPolicyList',
  configMap = 'configMapList',
  persistentVolumeClaim = 'persistentVolumeClaimList',
  secret = 'secretList',
  replicationController = 'replicationControllerList',
  statefulSet = 'statefulSetList',
  event = 'event',
  resource = 'resource',
}

export enum ListGroupIdentifier {
  cluster = 'clusterGroup',
  workloads = 'workloadsGroup',
  discovery = 'discoveryGroup',
  config = 'configGroup',
  none = 'none',
}
