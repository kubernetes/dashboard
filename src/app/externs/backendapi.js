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
 *   ErrStatus: !backendApi.ErrStatus,
 * }}
 */
backendApi.Error;

/**
 * @typedef {{
 *   message: string,
 *   code: number,
 *   status: string,
 *   reason: string
 * }}
 */
backendApi.ErrStatus;

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
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.ReplicationControllerList;

/**
 * @typedef {{
 *   deploymentList: !backendApi.DeploymentList,
 *   replicaSetList: !backendApi.ReplicaSetList,
 *   jobList: !backendApi.JobList,
 *   cronJobList: !backendApi.CronJobList,
 *   replicationControllerList: !backendApi.ReplicationControllerList,
 *   podList: !backendApi.PodList,
 *   daemonSetList: !backendApi.DaemonSetList,
 *   statefulSetList: !backendApi.StatefulSetList,
 *   serviceList: !backendApi.ServiceList,
 *   ingressList: !backendApi.IngressList,
 *   configMapList: !backendApi.ConfigMapList,
 *   persistentVolumeClaimList: !backendApi.PersistentVolumeClaimList,
 *   secretList: !backendApi.SecretList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Overview;

/**
 * @typedef {{
 *   deploymentList: !backendApi.DeploymentList,
 *   replicaSetList: !backendApi.ReplicaSetList,
 *   jobList: !backendApi.JobList,
 *   cronJobList: !backendApi.CronJobList,
 *   replicationControllerList: !backendApi.ReplicationControllerList,
 *   podList: !backendApi.PodList,
 *   daemonSetList: !backendApi.DaemonSetList,
 *   statefulSetList: !backendApi.StatefulSetList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Workloads;

/**
 * @typedef {{
 *   nodeList: !backendApi.NodeList,
 *   namespaceList: !backendApi.NamespaceList,
 *   persistentVolumeList: !backendApi.PersistentVolumeList,
 *   roleList: !backendApi.RoleList,
 *   storageClassList: !backendApi.StorageClassList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Cluster;

/**
 * @typedef {{
 *   serviceList: !backendApi.ServiceList,
 *   ingressList: !backendApi.IngressList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Discovery;

/**
 * @typedef {{
 *   configMapList: !backendApi.ConfigMapList,
 *   persistentVolumeClaimList: !backendApi.PersistentVolumeClaimList,
 *   secretList: !backendApi.SecretList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Config;

/**
 * @typedef {{
 *   deploymentList: !backendApi.DeploymentList,
 *   replicaSetList: !backendApi.ReplicaSetList,
 *   jobList: !backendApi.JobList,
 *   replicationControllerList: !backendApi.ReplicationControllerList,
 *   podList: !backendApi.PodList,
 *   daemonSetList: !backendApi.DaemonSetList,
 *   statefulSetList: !backendApi.StatefulSetList,
 *   nodeList: !backendApi.NodeList,
 *   namespaceList: !backendApi.NamespaceList,
 *   persistentVolumeList: !backendApi.PersistentVolumeList,
 *   roleList: !backendApi.RoleList,
 *   storageClassList: !backendApi.StorageClassList,
 *   serviceList: !backendApi.ServiceList,
 *   ingressList: !backendApi.IngressList,
 *   configMapList: !backendApi.ConfigMapList,
 *   persistentVolumeClaimList: !backendApi.PersistentVolumeClaimList,
 *   secretList: !backendApi.SecretList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.Search;

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
 *   initContainerImages: !Array<string>
 * }}
 */
backendApi.ReplicationController;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 *   initContainerImages: !Array<string>
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
 *   initContainerImages: !Array<string>,
 *   eventList: !backendApi.EventList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.ReplicaSetDetail;

/**
 * @typedef {{
 *   replicaSets: !Array<!backendApi.ReplicaSet>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.ReplicaSetList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 *   initContainerImages: !Array<string>,
 *   parallelism: number
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
 *   initContainerImages: !Array<string>,
 *   eventList: !backendApi.EventList,
 *   parallelism: number,
 *   completions: number
 * }}
 */
backendApi.JobDetail;

/**
 * @typedef {{
 *   jobs: !Array<!backendApi.Job>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.JobList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   schedule: string,
 *   suspend: boolean,
 *   active: number,
 *   lastSchedule: string
 * }}
 */
backendApi.CronJob;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   schedule: string,
 *   suspend: boolean,
 *   active: number,
 *   lastSchedule: string,
 *   concurrencyPolicy: string,
 *   startingDeadlineSeconds: number,
 *   activeJobs: !backendApi.JobList,
 *   events: !backendApi.EventList
 * }}
 */
backendApi.CronJobDetail;

/**
 * @typedef {{
 *   items: !Array<!backendApi.CronJob>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.CronJobList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 *   initContainerImages: !Array<string>
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
 *   initContainerImages: !Array<string>,
 *   eventList: !backendApi.EventList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.StatefulSetDetail;

/**
 * @typedef {{
 *   statefulSets: !Array<!backendApi.StatefulSet>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
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
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
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
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
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
 *   initContainerImages: !Array<string>
 * }}
 */
backendApi.Deployment;

/**
 * @typedef {{
 *   deployments: !Array<!backendApi.Deployment>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.DeploymentList;

/**
 * @typedef {{
 *   maxSurge: !(number|string),
 *   maxUnavailable: !(number|string),
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
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.DeploymentDetail;

/**
 * @typedef {{
 *   pods: !Array<!backendApi.Pod>,
 *   listMeta: !backendApi.ListMeta,
 *   cumulativeMetrics: (!Array<!backendApi.Metric>|null),
 *   errors: !Array<!backendApi.Error>
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
 *   creationTimestamp: string,
 *   annotations: !Object<string, string>
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
 *   initContainerImages: !Array<string>,
 *   podInfo: !backendApi.PodInfo,
 *   podList: !backendApi.PodList,
 *   serviceList: !backendApi.ServiceList,
 *   eventList: !backendApi.EventList,
 *   hasMetrics: boolean,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.ReplicationControllerDetail;

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
 *   configMapKeyRef: backendApi.ConfigMapKeyRef,
 *   secretKeyRef: backendApi.SecretKeyRef
 * }}
 */
backendApi.EnvVarSource;

/**
 * @typedef {{
 *   name: string,
 *   key: string,
 * }}
 */
backendApi.ConfigMapKeyRef;

/**
 * @typedef {{
 *   name: string,
 *   key: string,
 * }}
 */
backendApi.SecretKeyRef;

/**
 * @typedef {{
 *   replicas: number
 * }}
 */
backendApi.ReplicationControllerSpec;

/**
 * @typedef {{
 *   desiredReplicas: number,
 *   actualReplicas: number,
 * }}
 */
backendApi.ReplicaCounts;

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
 *   status: string,
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
 *   qosClass: string,
 *   metrics: backendApi.PodMetrics,
 *   warnings: !Array<!backendApi.Event>,
 *   nodeName: string
 * }}
 */
backendApi.Pod;

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
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   initContainers: !Array<!backendApi.Container>,
 *   containers: !Array<!backendApi.Container>,
 *   podPhase: string,
 *   podIP: string,
 *   nodeName: string,
 *   restartCount: number,
 *   metrics: backendApi.PodMetrics,
 *   conditions: !backendApi.ConditionList,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.PodDetail;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 * }}
 */
backendApi.Role;

/**
 * @typedef {{
 *   items: !Array<backendApi.Role>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.RoleList;

/**
 * @typedef {{
 *   endpoints: !Array<!backendApi.Endpoint>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.EndpointList;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  internalEndpoint: !backendApi.Endpoint,
 *  externalEndpoints: !Array<!backendApi.Endpoint>,
 *  endpointList: !Array<!backendApi.Endpoint>,
 *  selector: !Object<string, string>,
 *  type: string,
 *  clusterIP: string,
 *  podList: !backendApi.PodList,
 *  sessionAffinity: string,
 *  errors: !Array<!backendApi.Error>
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
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.ServiceList;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  labelSelector: !Object<string, string>,
 *  containerImages: !Array<string>,
 *  initContainerImages: !Array<string>,
 *  podInfo: !backendApi.PodInfo,
 *  podList: !backendApi.PodList,
 *  serviceList: !backendApi.ServiceList,
 *  hasMetrics: boolean,
 *  eventList: !backendApi.EventList,
 *  errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.DaemonSetDetail;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  pods: !backendApi.PodInfo,
 *  containerImages: !Array<string>,
 *  initContainerImages: !Array<string>
 * }}
 */
backendApi.DaemonSet;

/**
 * @typedef {{
 *  daemonSets: !Array<backendApi.DaemonSet>,
 *  listMeta: !backendApi.ListMeta,
 *  errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.DaemonSetList;

/**
 * @typedef {{
 *  objectMeta: !backendApi.ObjectMeta,
 *  typeMeta: !backendApi.TypeMeta,
 *  host: string,
 *  ports: !Array<{port: number, protocol: string}>,
 *  nodeName: string,
 *  port: number,
 *  ready: string
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
 *   podNames: !Array<string>,
 *   containerNames: !Array<string>,
 *   initContainerNames: !Array<string>
 * }}
 */
backendApi.LogSources;

/**
 * @typedef {{
 *   info: !backendApi.LogInfo,
 *   logs: !Array<backendApi.LogLine>,
 *   selection: !backendApi.LogSelection,
 * }}
 */
backendApi.LogDetails;

/**
 * @typedef {{
 *   podName: string,
 *   containerName: string,
 *   initContainerName: string,
 *   fromDate: string,
 *   toDate: string,
 *   truncated: boolean
 * }}
 */
backendApi.LogInfo;

/**
 * @typedef {{
 *   timestamp: string,
 *   content: string,
 * }}
 */
backendApi.LogLine;

/**
 * @typedef {{
 *   logFilePosition: string,
 *   referencePoint: !backendApi.LogLineReference,
 *   offsetFrom: number,
 *   offsetTo: number
 * }}
 */
backendApi.LogSelection;

/**
 * @typedef {{
 *   timestamp: string,
 *   lineNum: number,
 * }}
 */
backendApi.LogLineReference;

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
 *   namespaces: !Array<!backendApi.Namespace>,
 *   errors: !Array<!backendApi.Error>
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
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.NamespaceDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   type: string,
 *   data: !Object<string, string>,
 * }}
 */
backendApi.SecretDetail;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   type: string
 * }}
 */
backendApi.Secret;

/**
 * @typedef {{
 *   secrets: !Array<!backendApi.Secret>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
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
 *   items: !Array<!backendApi.Ingress>,
 *   errors: !Array<!backendApi.Error>
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
 *   podCapacity: number,
 *   podFraction: number
 * }}
 */
backendApi.NodeAllocatedResources;

/**
 * @typedef {{
 *   type: string,
 *   address: string
 * }}
 */
backendApi.NodeAddress;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   phase: string,
 *   allocatedResources: !backendApi.NodeAllocatedResources,
 *   podCIDR: string,
 *   providerID: string,
 *   unschedulable: boolean,
 *   nodeInfo: !backendApi.NodeInfo,
 *   conditions: !backendApi.ConditionList,
 *   containerImages: !Array<string>,
 *   initContainerImages: !Array<string>,
 *   podList: !backendApi.PodList,
 *   eventList: !backendApi.EventList,
 *   addresses: !backendApi.NodeAddress,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.NodeDetail;

/**
 * @typedef {{
 *   nodes: !Array<!backendApi.Node>,
 *   listMeta: !backendApi.ListMeta,
 *   errors: !Array<!backendApi.Error>
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
 *   storageClass: string,
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
 *   items: !Array<!backendApi.PersistentVolumeClaim>,
 *   errors: !Array<!backendApi.Error>
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
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   provisioner: string,
 *   parameters: !Array<!Object<string,string>>
 * }}
 */
backendApi.StorageClass;

/**
 * @typedef {{
 *   listMeta: !backendApi.ListMeta,
 *   storageClasses: !Array<!backendApi.StorageClass>,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.StorageClassList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   pods: !backendApi.PodInfo,
 *   containerImages: !Array<string>,
 *   initContainerImages: !Array<string>
 * }}
 */
backendApi.Controller;

/**
 * @typedef {{
 *   clusterName: string,
 *   itemsPerPage: number
 * }}
 */
backendApi.Settings;

/**
 * @typedef {{
 *   name: string
 * }}
 */
backendApi.APIVersion;

/**
 * @typedef {{
 *   token: string
 * }}
 */
backendApi.CsrfToken;

/**
 * @typedef {{
 *   username: string,
 *   password: string,
 *   token: string,
 *   kubeConfig: string,
 * }}
 */
backendApi.LoginSpec;

/**
 * @typedef {{
 *   jweToken: string,
 *   errors: !Array<!backendApi.Error>
 * }}
 */
backendApi.AuthResponse;

/**
 * @typedef {{
 *   tokenPresent: boolean,
 *   headerPresent: boolean,
 *   httpsMode: boolean
 * }}
 */
backendApi.LoginStatus;

/**
 * @typedef {{
 *   jweToken: string
 * }}
 */
backendApi.TokenRefreshSpec;

/** @typedef {string} */
backendApi.AuthenticationMode;

/**
 * @typedef {{
 *    modes: !Array<!backendApi.AuthenticationMode>
 * }}
 */
backendApi.LoginModesResponse;

/**
 * @typedef {{
 *  TOKEN: !backendApi.AuthenticationMode,
 *  BASIC: !backendApi.AuthenticationMode,
 *  }}
 */
backendApi.SupportedAuthenticationModes;
