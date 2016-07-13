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
 *   content: string
 * }}
 */
backendApi.AppDeploymentFromFileSpec;

/**
 * @typedef {{
 *   namespace: string,
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
 *   petSetList: !backendApi.PetSetList
 * }}
 */
backendApi.Workloads;

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
backendApi.PetSet;

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
backendApi.PetSetDetail;

/**
 * @typedef {{
 *   petSets: !Array<!backendApi.PetSet>,
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.PetSetList;

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
 *   listMeta: !backendApi.ListMeta
 * }}
 */
backendApi.PodList;

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
 *   hasMetrics: boolean
 * }}
 */
backendApi.ReplicationControllerDetail;

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
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   podPhase: string,
 *   podIP: string,
 *   restartCount: number,
 *   metrics: backendApi.PodMetrics
 * }}
 */
backendApi.Pod;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta,
 *   containerImages: !Array<string>,
 *   podPhase: string,
 *   podIP: string,
 *   nodeName: string,
 *   restartCount: number,
 *   metrics: backendApi.PodMetrics
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
 *  labelSelector: !Object<string, string>,
 *  containerImages: !Array<string>,
 *  podInfo: !backendApi.PodInfo,
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
 *   namespaces: !Array<string>
 * }}
 */
backendApi.NamespaceList;

/**
 * @typedef {{
 *   name: string,
 *   restartCount: number
 * }}
 */
backendApi.PodContainer;

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
 *   sinceTime: string,
 *   logs: !Array<string>,
 *   container: string
 * }}
 */
backendApi.Logs;

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
 *   secrets: !Array<string>
 * }}
 */
backendApi.SecretsList;

/**
 * @typedef {{
 *   objectMeta: !backendApi.ObjectMeta,
 *   typeMeta: !backendApi.TypeMeta
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
 *   type: string,
 *   status: string,
 *   lastHeartbeatTime: ?string,
 *   lastTransitionTime: ?string,
 *   reason: string,
 *   message: string
 * }}
 */
backendApi.NodeCondition;

/**
 * @typedef {{
 *   nodes: !Array<!backendApi.NodeCondition>
 * }}
 */
backendApi.NodeConditionList;

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
 *   conditions: !backendApi.NodeConditionList,
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

/** @typedef {{serverTime: number}} */
const appConfig_DO_NOT_USE_DIRECTLY = {};
