// Copyright 2015 Google Inc. All Rights Reserved.
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

/**
 * @fileoverview Externs for backend API and model objects. This should be kept in sync with the
 * backend code.
 *
 * Guidelines:
 *  - Model JSONs should have the same name as backend structs.
 *
 * @externs
 */

const backendApi = {};

/**
 * @typedef {{
 *    itemsPerPage: number,
 *    page: number,
 *    namespace: string,
 *    name: (string|undefined)
 * }}
 */
backendApi.PaginationQuery;

/**
 * @typedef {{
 *   totalItems: number,
 * }}
 */
backendApi.ListMeta;

/**
 * @typedef {{
 *   port: (number|null),
 *   protocol: string,
 *   targetPort: (number|null)
 * }}
 */
backendApi.PortMapping;

/**
 * @typedef {{
 *   name: string,
 *   value: string
 * }}
 */
backendApi.EnvironmentVariable;

/**
 * @typedef {{
 *  key: string,
 *  value: string
 * }}
 */
backendApi.Label;

/**
 * @typedef {{
 *   containerImage: string,
 *   containerCommand: ?string,
 *   containerCommandArgs: ?string,
 *   isExternal: boolean,
 *   name: string,
 *   description: ?string,
 *   portMappings: !Array<!backendApi.PortMapping>,
 *   labels: !Array<!backendApi.Label>,
 *   replicas: number,
 *   namespace: string,
 *   memoryRequirement: ?string,
 *   cpuRequirement: ?number,
 *   runAsPrivileged: boolean,
 * }}
 */
backendApi.AppDeploymentSpec;

/**
 * @typedef {{
 *   name: string,
 *   content: string,
 *   validate: boolean,
 * }}
 */
backendApi.AppDeploymentFromFileSpec;

/**
 * @typedef {{
 *   events: !Array<!backendApi.Event>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.EventList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   message: string,
 *   sourceComponent: string,
 *   sourceHost: string,
 *   object: string,
 *   count: number,
 *   firstSeen: string,
 *   lastSeen: string,
 *   reason: string,
 *   type: string
 * }}
 */
backendApi.Event;

/**
 * @typedef {{
 *   replicationControllers: !Array<!backendApi.ReplicationController>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.ReplicationControllerList;

/**
 * @typedef {{
 *   deploymentList: !backendApi.DeploymentList,
 *   replicaSetList: !backendApi.ReplicaSetList,
 *   jobList: !backendApi.JobList,
 *   replicationControllerList: !backendApi.ReplicationControllerList,
 *   podList: !backendApi.PodList,
 *   daemonSetList: !backendApi.DaemonSetList,
 *   statefulSetList: !backendApi.StatefulSetList
 * }}
 */
backendApi.Workloads;

/**
 * @typedef {{
 *   nodeList: !backendApi.NodeList,
 *   namespaceList: !backendApi.NamespaceList,
 *   persistentVolumeList: !backendApi.PersistentVolumeList,
 * }}
 */
backendApi.Admin;

/**
 * @typedef {{
 *   serviceList: !backendApi.ServiceList,
 *   ingressList: !backendApi.IngressList,
 * }}
 */
backendApi.ServicesAndDiscovery;

/**
 * @typedef {{
 *   configMapList: !backendApi.ConfigMapList,
 *   secretList: !backendApi.SecretList,
 * }}
 */
backendApi.Config;

/**
 * @typedef {{
 *   timestamp: string,
 *   value: number
 * }}
 */
backendApi.MetricResult;

/**
 * @typedef {{
 *   reason: string,
 *   message: string
 * }}
 */
backendApi.PodEvent;

/**
 * @typedef {{
 *   cpuUsage: ?number,
 *   memoryUsage: ?number,
 *   cpuUsageHistory: !Array<!backendApi.MetricResult>,
 *   memoryUsageHistory: !Array<!backendApi.MetricResult>
 * }}
 */
backendApi.PodMetrics;

/**
 * @typedef {{
 *   current: number,
 *   desired: number,
 *   running: number,
 *   pending: number,
 *   failed: number,
 *   succeeded: number,
 *   warnings: !Array<!backendApi.Event>
 * }}
 */
backendApi.PodInfo;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 * }}
 */
backendApi.ReplicationController;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 * }}
 */
backendApi.ReplicaSet;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   podInfo: !backendApi.PodInfo,
 *   podList: !backendApi.PodList,
 *   containerImages: !Array<string>,
 *   eventList: !backendApi.EventList
 * }}
 */
backendApi.ReplicaSetDetail;

/**
 * @typedef {{
 *   replicaSets: !Array<!backendApi.ReplicaSet>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.ReplicaSetList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>
 * }}
 */
backendApi.Job;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   podInfo: !backendApi.PodInfo,
 *   podList: !backendApi.PodList,
 *   containerImages: !Array<string>,
 *   eventList: !backendApi.EventList,
 *   paralleism: number,
 *   completions: number
 * }}
 */
backendApi.JobDetail;

/**
 * @typedef {{
 *   jobs: !Array<!backendApi.Job>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.JobList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 * }}
 */
backendApi.StatefulSet;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   podInfo: !backendApi.PodInfo,
 *   podList: !backendApi.PodList,
 *   containerImages: !Array<string>,
 *   eventList: !backendApi.EventList
 * }}
 */
backendApi.StatefulSetDetail;

/**
 * @typedef {{
 *   statefulSets: !Array<!backendApi.StatefulSet>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.StatefulSetList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 * }}
 */
backendApi.ConfigMap;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   data: !Object<string, string>,
 * }}
 */
backendApi.ConfigMapDetail;

/**
 * @typedef {{
 *   items: !Array<!backendApi.ConfigMap>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.ConfigMapList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   capacity: Object<string, string>,
 *   accessModes: Array<string>,
 *   status: !string,
 *   claim: string,
 *   reason: string,
 * }}
 */
backendApi.PersistentVolume;

/**
 * @typedef {{
 *   items: !Array<!backendApi.PersistentVolume>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.PersistentVolumeList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   status: !string,
 *   claim: string,
 *   reclaimPolicy: string,
 *   accessModes: Array<string>,
 *   capacity: Object<string, string>,
 *   message: string,
 *   persistentVolumeSource: backendApi.PersistentVolumeSource,
 * }}
 */
backendApi.PersistentVolumeDetail;

/**
 * @typedef {{
 *   gcePersistentDisk: backendApi.GCEPersistentDiskVolumeSource,
 *   awsElasticBlockStore: backendApi.AWSElasticBlockStorageVolumeSource,
 *   hostPath: backendApi.HostPathVolumeSource,
 *   glusterfs: backendApi.GlusterfsVolumeSource,
 *   nfs: backendApi.NFSVolumeSource,
 *   rbd: backendApi.RBDVolumeSource,
 *   iscsi: backendApi.ISCSIVolumeSource,
 *   cinder: backendApi.CinderVolumeSource,
 *   fc: backendApi.FCVolumeSource,
 *   flocker: backendApi.FlockerVolumeSource,
 * }}
 */
backendApi.PersistentVolumeSource;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   scopes: Array<string>,
 *   statusList: Object<string, !backendApi.ResourceQuotaStatus>,
 * }}
 */
backendApi.ResourceQuotaDetail;

/**
 * @typedef {{
 *   used: string,
 *   hard: string,
 * }}
 */
backendApi.ResourceQuotaStatus;

/**
 * @typedef {{
 *   items: !Array<!backendApi.ResourceQuotaDetail>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.ResourceQuotaDetailList;

/**
 * @typedef {{
 *   pdName: !string,
 *   fsType: string,
 *   partition: number,
 *   readOnly: boolean,
 * }}
 */
backendApi.GCEPersistentDiskVolumeSource;

/**
 * @typedef {{
 *   volumeID: !string,
 *   fsType: string,
 *   partition: number,
 *   readOnly: boolean,
 * }}
 */
backendApi.AWSElasticBlockStorageVolumeSource;

/**
 * @typedef {{
 *   path: !string,
 * }}
 */
backendApi.HostPathVolumeSource;

/**
 * @typedef {{
 *   endpoints: !string,
 *   path: !string,
 *   readOnly: boolean,
 * }}
 */
backendApi.GlusterfsVolumeSource;

/**
 * @typedef {{
 *   server: !string,
 *   path: !string,
 *   readOnly: boolean,
 * }}
 */
backendApi.NFSVolumeSource;

/**
 * @typedef {{
 *   monitors: !Array<string>,
 *   image: !string,
 *   fsType: string,
 *   pool: string,
 *   user: string,
 *   keyring: string,
 *   secretRef: backendApi.LocalObjectReference,
 *   readOnly: boolean,
 * }}
 */
backendApi.RBDVolumeSource;

/**
 * @typedef {{
 *   name: string,
 * }}
 */
backendApi.LocalObjectReference;

/**
 * @typedef {{
 *   targetPortal: string,
 *   iqn: string,
 *   lun: number,
 *   fsType: string,
 *   readOnly: boolean,
 * }}
 */
backendApi.ISCSIVolumeSource;

/**
 * @typedef {{
 *   volumeID: !string,
 *   fsType: string,
 *   readOnly: boolean,
 * }}
 */
backendApi.CinderVolumeSource;

/**
 * @typedef {{
 *   monitors: !Array<string>,
 *   path: string,
 *   user: string,
 *   secretFile: string,
 *   secretRef: backendApi.LocalObjectReference,
 *   readonly: boolean,
 * }}
 */
backendApi.CephFSVolumeSource;

/**
 * @typedef {{
 *   targetWWNs: !Array<string>,
 *   lun: !number,
 *   fsType: string,
 *   readOnly: boolean,
 * }}
 */
backendApi.FCVolumeSource;

/**
 * @typedef {{
 *   datasetName: !string,
 * }}
 */
backendApi.FlockerVolumeSource;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 * }}
 */
backendApi.Deployment;

/**
 * @typedef {{
 *   deployments: !Array<!backendApi.Deployment>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.DeploymentList;

/**
 * @typedef {{
 *   maxSurge: !number,
 *   maxUnavailable: !number,
 * }}
 */
backendApi.RollingUpdateStrategy;

/**
 * @typedef {{
 *   replicas: !number,
 *   updated: !number,
 *   available: !number,
 *   unavailable: !number,
 * }}
 */
backendApi.DeploymentInfo;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   selector: !Array<backendApi.Label>,
 *   statusInfo: !backendApi.DeploymentInfo,
 *   strategy: !string,
 *   minReadySeconds: !number,
 *   revisionHistoryLimit: ?number,
 *   rollingUpdateStrategy: ?backendApi.RollingUpdateStrategy,
 *   oldReplicaSetList: !backendApi.ReplicaSetList,
 *   newReplicaSet: !backendApi.ReplicaSet,
 *   events: !backendApi.EventList,
 * }}
 */
backendApi.DeploymentDetail;

/**
 * @typedef {{
 *   pods: !Array<!backendApi.Pod>,
 *   listMeta: !backendApi.ListMeta,
 *   cumulativeMetrics: (!Array<!backendApi.Metric>|null),
 * }}
 */
backendApi.PodList;

/**
 * @typedef {{
 *   dataPoints: !Array<!backendApi.DataPoint>,
 *   metricName: string,
 *   aggregation: string,
 * }}
 */
backendApi.Metric;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 * }}
 */
backendApi.DataPoint;

/**
 * @typedef {{
 *   name: string,
 *   namespace: string,
 *   labels: !Object<string, string>,
 *   creationTimestamp: string
 * }}
 */
backendApi.ObjectMeta;

/**
 * @typedef {{
 *   kind: string,
 * }}
 */
backendApi.TypeMeta;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   labelSelector: !Object<string, string>,
 *   containerImages: !Array<string>,
 *   podInfo: !backendApi.PodInfo,
 *   podList: !backendApi.PodList,
 *   serviceList: !backendApi.ServiceList,
 *   eventList: !backendApi.EventList,
 *   hasMetrics: boolean
 * }}
 */
backendApi.ReplicationControllerDetail;

/**
 * @typedef {{
 *   name: string,
 *   image: string,
 *   env: !Array<!backendApi.EnvVar>,
 *   commands: Array<string>,
 *   args: Array<string>
 * }}
 */
backendApi.Container;

/**
 * @typedef {{
 *   name: string,
 *   value: string,
 *   valueFrom: backendApi.EnvVarSource
 * }}
 */
backendApi.EnvVar;

/**
 * @typedef {{
 *   configMapKeyRef: backendApi.ConfigMapKeyRef
 * }}
 */
backendApi.EnvVarSource;

/**
 * @typedef {{
 *   Name: string,
 *   key: string,
 * }}
 */
backendApi.ConfigMapKeyRef;

/**
 * @typedef {{
 *   replicas: number
 * }}
 */
backendApi.ReplicationControllerSpec;

/**
 * @typedef {{
 *   deleteServices: boolean
 * }}
 */
backendApi.DeleteReplicationControllerSpec;

/**
 * @typedef {{
 *   reason: string
 * }}
 */
backendApi.ContainerStateWaiting;

/**
 * @typedef {{
 *   reason: string,
 *   signal: number,
 *   exitCode: number
 * }}
 */
backendApi.ContainerStateTerminated;

/**
 * @typedef {{
 *   waiting: !backendApi.ContainerStateWaiting,
 *   terminated: !backendApi.ContainerStateTerminated
 * }}
 */
backendApi.ContainerState;

/**
 * @typedef {{
 *   type: string,
 *   status: string,
 *   lastProbeTime: ?string,
 *   lastTransitionTime: ?string,
 *   reason: string,
 *   message: string
 * }}
 */
backendApi.Condition;

/**
 * @typedef {{
 *   nodes: !Array<!backendApi.Condition>
 * }}
 */
backendApi.ConditionList;

/**
 * @typedef {{
 *   podPhase: string,
 *   containerStates: !Array<!backendApi.ContainerState>
 * }}
 */
backendApi.PodStatus;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   podStatus: !backendApi.PodStatus,
 *   podIP: string,
 *   restartCount: number,
 *   metrics: backendApi.PodMetrics,
 *   warnings: !Array<!backendApi.Event>
 * }}
 */
backendApi.Pod;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   containers: !Array<!backendApi.Container>,
 *   podPhase: string,
 *   podIP: string,
 *   nodeName: string,
 *   restartCount: number,
 *   metrics: backendApi.PodMetrics,
 *   conditions: !backendApi.ConditionList
 * }}
 */
backendApi.PodDetail;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  internalEndpoint: !backendApi.Endpoint,
 *  externalEndpoints: !Array<!backendApi.Endpoint>,
 *  selector: !Object<string, string>,
 *  type: string,
 *  clusterIP: string,
 *  podList: !backendApi.PodList
 * }}
 */
backendApi.ServiceDetail;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  internalEndpoint: !backendApi.Endpoint,
 *  externalEndpoints: !Array<!backendApi.Endpoint>,
 *  selector: !Object<string, string>,
 *  type: string,
 *  clusterIP: string
 * }}
 */
backendApi.Service;

/**
 * @typedef {{
 *   services: !Array<backendApi.Service>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.ServiceList;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  labelSelector: !Object<string, string>,
 *  containerImages: !Array<string>,
 *  podInfo: !backendApi.PodInfo,
 *  podList: !backendApi.PodList,
 *  serviceList: !backendApi.ServiceList,
 *  hasMetrics: boolean,
 *  eventList: !backendApi.EventList
 * }}
 */
backendApi.DaemonSetDetail;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  pods: !backendApi.PodInfo,
 *  containerImages: !Array<string>,
 * }}
 */
backendApi.DaemonSet;

/**
 * @typedef {{
 *  daemonSets: !Array<backendApi.DaemonSet>,
 *  listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.DaemonSetList;

/**
 * @typedef {{
 *  host: string,
 *  ports: !Array<{port: number, protocol: string}>
 * }}
 */
backendApi.Endpoint;

/**
 * @typedef {{
 *   name: string
 * }}
 */
backendApi.NamespaceSpec;

/**
 * @typedef {{
 *   name: string,
 *   restartCount: number
 * }}
 */
backendApi.PodContainer;

/**
 * @typedef {{
 *   containers: !Array<string>
 * }}
 */
backendApi.PodContainerList;

/**
 * @typedef {{
 *   name: string,
 *   startTime: ?string,
 *   totalRestartCount: number,
 *   podContainers: !Array<!backendApi.PodContainer>
 * }}
 */
backendApi.ReplicationControllerPodWithContainers;

/**
 * @typedef {{
 *   pods: !Array<!backendApi.ReplicationControllerPodWithContainers>
 * }}
 */
backendApi.ReplicationControllerPods;

/**
 * @typedef {{
 *   podId: string,
 *   logs: !Array<string>,
 *   container: string,
 *   firstLogLineReference: !backendApi.LogLineReference,
 *   lastLogLineReference: !backendApi.LogLineReference,
 *   logViewInfo: !backendApi.LogViewInfo
 * }}
 */
backendApi.Logs;

/**
 * @typedef {{
 *   logTimestamp: string,
 *   lineNum: number,
 * }}
 */
backendApi.LogLineReference;

/**
 * @typedef {{
 *   referenceLogLineId: !backendApi.LogLineReference,
 *   relativeFrom: number,
 *   relativeTo: number
 * }}
 */
backendApi.LogViewInfo;

/**
 * @typedef {{
 *   name: string,
 *   namespace: string
 * }}
 */
backendApi.AppNameValiditySpec;

/**
 * @typedef {{
 *   valid: boolean
 * }}
 */
backendApi.AppNameValidity;

/**
 * @typedef {{
 *   reference: string
 * }}
 */
backendApi.ImageReferenceValiditySpec;

/**
 * @typedef {{
 *   valid: boolean,
 *   reason: string
 * }}
 */
backendApi.ImageReferenceValidity;

/**
 * @typedef {{
 *    protocols: !Array<string>
 * }}
 */
backendApi.Protocols;

/**
 * @typedef {{
 *    valid: boolean
 * }}
 */
backendApi.ProtocolValidity;

/**
 * @typedef {{
 *    protocol: string,
 *    isExternal: boolean
 * }}
 */
backendApi.ProtocolValiditySpec;

/**
 *  @typedef {{
 *    name: string,
 *    namespace: string,
 *    data: string,
 *  }}
 */
backendApi.SecretSpec;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   phase: string
 * }}
 */
backendApi.Namespace;

/**
 * @typedef {{
 *   listMeta: !backendApi.ListMeta,
 *   namespaces: !Array<!backendApi.Namespace>
 * }}
 */
backendApi.NamespaceList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   phase: string,
 *   eventList: !backendApi.EventList,
 *   resourceLimits: Array<!backendApi.LimitRange>,
 *   resourceQuotaList: !backendApi.ResourceQuotaDetailList,
 * }}
 */
backendApi.NamespaceDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   data: !Object<string, string>,
 * }}
 */
backendApi.SecretDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta
 * }}
 */
backendApi.Secret;

/**
 * @typedef {{
 *   secrets: !Array<!backendApi.Secret>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.SecretList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 * }}
 */
backendApi.IngressDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta
 * }}
 */
backendApi.Ingress;

/**
 * @typedef {{
 *   listMeta: !backendApi.ListMeta,
 *   items: !Array<!backendApi.Ingress>
 * }}
 */
backendApi.IngressList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   ready: string
 * }}
 */
backendApi.Node;

/**
 * @typedef {{
 *   machineID: string,
 *   systemUUID: string,
 *   bootID: string,
 *   kernelVersion: string,
 *   osImage: string,
 *   containerRuntimeVersion: string,
 *   kubeletVersion: string,
 *   kubeProxyVersion: string,
 *   operatingSystem: string,
 *   architecture: string
 * }}
 */
backendApi.NodeInfo;

/**
 * @typedef {{
 *   cpuRequests: number,
 *   cpuRequestsFraction: number,
 *   cpuLimits: number,
 *   cpuLimitsFraction: number,
 *   cpuCapacity: number,
 *   memoryRequests: number,
 *   memoryRequestsFraction: number,
 *   memoryLimits: number,
 *   memoryLimitsFraction: number,
 *   memoryCapacity: number,
 *   allocatedPods: number,
 *   podCapacity: number
 * }}
 */
backendApi.NodeAllocatedResources;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   phase: string,
 *   allocatedResources: !backendApi.NodeAllocatedResources,
 *   externalID: string,
 *   podCIDR: string,
 *   providerID: string,
 *   unschedulable: boolean,
 *   nodeInfo: !backendApi.NodeInfo,
 *   conditions: !backendApi.ConditionList,
 *   containerImages: !Array<string>,
 *   podList: !backendApi.PodList,
 *   eventList: !backendApi.EventList
 * }}
 */
backendApi.NodeDetail;

/**
 * @typedef {{
 *   nodes: !Array<!backendApi.Node>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.NodeList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   status: string,
 *   volume: string,
 *   capacity: string,
 *   accessModes: !Array<string>
 * }}
 */
backendApi.PersistentVolumeClaimDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   Status: !string,
 *   Volume: !string
 * }}
 */
backendApi.PersistentVolumeClaim;

/**
 * @typedef {{
 *   listMeta: !backendApi.ListMeta,
 *   items: !Array<!backendApi.PersistentVolumeClaim>
 * }}
 */
backendApi.PersistentVolumeClaimList;

/**
 * @typedef {{
 *   resourceType: string,
 *   resourceName: string,
 *   min: string,
 *   max: string,
 *   default: string,
 *   defaultRequest: string,
 *   maxLimitRequestRatio: string
 * }}
 */
backendApi.LimitRange;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   scaleTargetRef: !backendApi.ScaleTargetRef,
 *   minReplicas: number,
 *   maxReplicas: number,
 *   currentCPUUtilization: number,
 *   targetCPUUtilization: ?number,
 *   currentReplicas: number,
 *   desiredReplicas: number,
 *   lastScaleTime: string
 * }}
 */
backendApi.HorizontalPodAutoscalerDetail;

/**
 * @typedef {{
 *   kind: string,
 *   name: string,
 * }}
 */
backendApi.ScaleTargetRef;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   scaleTargetRef: !backendApi.ScaleTargetRef,
 *   minReplicas: number,
 *   maxReplicas: number,
 *   currentCPUUtilization: number,
 *   targetCPUUtilization: ?number
 * }}
 */
backendApi.HorizontalPodAutoscaler;

/**
 * @typedef {{
 *   listMeta: !backendApi.ListMeta,
 *   horizontalpodautoscalers: !Array<!backendApi.HorizontalPodAutoscaler>
 * }}
 */
backendApi.HorizontalPodAutoscalerList;

/**
 * @typedef {{
 *   kind: !string,
 *   joblist: backendApi.JobList,
 *   replicasetlist: backendApi.ReplicaSetList,
 *   replicationcontrollerlist: backendApi.ReplicationControllerList,
 *   daemonsetlist: backendApi.DaemonSetList,
 *   statefulsetlist: backendApi.StatefulSetList
 * }}
 */
backendApi.Controller;

/** @typedef {{serverTime: number}} */
const appConfig_DO_NOT_USE_DIRECTLY = {};
