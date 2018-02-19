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

export interface CsrfToken { token: string; }

export interface LoginSpec {
  username: string;
  password: string;
  token: string;
  kubeconfig: string;
}

export interface LoginStatus {
  tokenPresent: boolean;
  headerPresent: boolean;
  httpsMode: boolean;
}

export interface AuthResponse {
  jweToken: string;
  errors: K8sError[];
}

export interface LocalSettings { isThemeDark: boolean; }

export interface AppConfig { serverTime: number; }

export interface CanIResponse { allowed: boolean; }

interface StringMap {
  [key: string]: string;
}

export interface ErrStatus {
  message: string;
  code: number;
  status: string;
  reason: string;
}

export interface K8sError { errStatus: ErrStatus; }

export interface ObjectMeta {
  name: string;
  namespace: string;
  labels: StringMap;
  annotations: StringMap;
  creationTimestamp: string;
  uid: string;
}

export interface TypeMeta { kind: string; }

export interface ListMeta { totalItems: number; }

export interface Condition {
  type: string;
  status: string;
  lastProbeTime: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

export interface ContainerStateWaiting { reason: string; }

export interface ContainerStateTerminated {
  reason: string;
  signal: number;
  exitCode: number;
}

export interface ContainerState {
  waiting: ContainerStateWaiting;
  terminated: ContainerStateTerminated;
}

export interface EventList extends ResourceList { events: Event[]; }

export interface Event {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  message: string;
  sourceComponent: string;
  sourceHost: string;
  object: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  reason: string;
  type: string;
}

export interface MetricResult {
  timestamp: string;
  value: number;
}

export interface Metric {
  dataPoints: DataPoint[];
  metricName: string;
  aggregation: string;
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface ConfigMapKeyRef {
  name: string;
  key: string;
}

export interface SecretKeyRef {
  name: string;
  key: string;
}

export interface EnvVar {
  name: string;
  value: string;
  valueFrom: EnvVarSource;
}

export interface EnvVarSource {
  configMapKeyRef: ConfigMapKeyRef;
  secretKeyRef: SecretKeyRef;
}

export interface Container {
  name: string;
  image: string;
  env: EnvVar[];
  commands: string[];
  args: string[];
}

export interface PodMetrics {
  cpuUsage: number;
  memoryUsage: number;
  cpuUsageHistory: MetricResult[];
  memoryUsageHistory: MetricResult[];
}

export interface Status {
  running: number;
  failed: number;
  pending: number;
  succeeded: number;
}

export interface PodStatus {
  podPhase: string;
  status: string;
  containerStates: ContainerState[];
}

export interface PodInfo {
  current: number;
  desired: number;
  running: number;
  pending: number;
  failed: number;
  succeeded: number;
  warnings: Event[];
}

export interface PodDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  initContainers: Container[];
  containers: Container[];
  podPhase: string;
  podIP: string;
  nodeName: string;
  restartCount: number;
  metrics: PodMetrics;
  conditions: Condition[];
  errors: K8sError[];
}

export interface Pod {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  podStatus: PodStatus;
  podIP: string;
  restartCount: number;
  qosClass: string;
  metrics: PodMetrics;
  warnings: Event[];
  nodeName: string;
}

export interface PodList extends ResourceList {
  pods: Pod[];
  status: Status;
  podInfo: PodInfo;
  cumulativeMetrics: Metric[]|null;
  errors: K8sError[];
}

export interface NodeAllocatedResources {
  cpuRequests: number;
  cpuRequestsFraction: number;
  cpuLimits: number;
  cpuLimitsFraction: number;
  cpuCapacity: number;
  memoryRequests: number;
  memoryRequestsFraction: number;
  memoryLimits: number;
  memoryLimitsFraction: number;
  memoryCapacity: number;
  allocatedPods: number;
  podCapacity: number;
  podFraction: number;
}

export interface NodeInfo {
  machineID: string;
  systemUUID: string;
  bootID: string;
  kernelVersion: string;
  osImage: string;
  containerRuntimeVersion: string;
  kubeletVersion: string;
  kubeProxyVersion: string;
  operatingSystem: string;
  architecture: string;
}

export interface NodeAddress {
  type: string;
  address: string;
}

export interface NodeTaint {
  key: string;
  value: string;
  effect: string;
  timeAdded: number;
}

export interface NodeDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  phase: string;
  podCIDR: string;
  providerID: string;
  unschedulable: boolean;
  allocatedResources: NodeAllocatedResources;
  nodeInfo: NodeInfo;
  containerImages: string[];
  initContainerImages: string[];
  addresses: NodeAddress[];
  taints: NodeTaint[];
  conditions: Condition[];
  podList: PodList;
  eventList: EventList;
  errors: K8sError[];
}

export interface Node {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  ready: string;
}

export interface NodeList extends ResourceList {
  nodes: Node[];
  errors: K8sError[];
}

export interface ReplicaSet {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface ReplicaSetList extends ResourceList {
  replicaSets: ReplicaSet[];
  status: Status;
  errors: K8sError[];
}

export interface ResourceList { listMeta: ListMeta; }

export interface PortMapping {
  port: number|null;
  protocol: string;
  targetPort: number|null;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
}

export interface Label {
  key: string;
  value: string;
}

export interface AppDeploymentSpec {
  containerImage: string;
  containerCommand?: string;
  containerCommandArgs?: string;
  isExternal: boolean;
  name: string;
  description?: string;
  portMappings: PortMapping[];
  labels: Label[];
  replicas: number;
  namespace: string;
  memoryRequirement?: string;
  cpuRequirement?: number;
  runAsPrivileged: boolean;
}

export interface AppDeploymentContentSpec {
  name: string;
  namespace: string;
  content: string;
  validate: boolean;
}

export interface ReplicationControllerList {
  replicationControllers: ReplicationController[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface PodEvent {
  reason: string;
  message: string;
}

export interface ReplicationController {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface ReplicaSet {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface ReplicaSetDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  podInfo: PodInfo;
  podList: PodList;
  containerImages: string[];
  initContainerImages: string[];
  eventList: EventList;
  errors: K8sError[];
}

export interface ReplicaSetList {
  replicaSets: ReplicaSet[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface ResourceQuotaDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  scopes: string[];
  // TODO statusList: Object<string; ResourceQuotaStatus>;
}

export interface ResourceQuotaStatus {
  used: string;
  hard: string;
}

export interface ResourceQuotaDetailList {
  items: ResourceQuotaDetail[];
  listMeta: ListMeta;
}

export interface GCEPersistentDiskVolumeSource {
  pdName: string;
  fsType: string;
  partition: number;
  readOnly: boolean;
}

export interface AWSElasticBlockStorageVolumeSource {
  volumeID: string;
  fsType: string;
  partition: number;
  readOnly: boolean;
}

export interface HostPathVolumeSource { path: string; }

export interface GlusterfsVolumeSource {
  endpoints: string;
  path: string;
  readOnly: boolean;
}

export interface NFSVolumeSource {
  server: string;
  path: string;
  readOnly: boolean;
}

export interface RBDVolumeSource {
  monitors: string[];
  image: string;
  fsType: string;
  pool: string;
  user: string;
  keyring: string;
  secretRef: LocalObjectReference;
  readOnly: boolean;
}

export interface LocalObjectReference { name: string; }

export interface ISCSIVolumeSource {
  targetPortal: string;
  iqn: string;
  lun: number;
  fsType: string;
  readOnly: boolean;
}

export interface CinderVolumeSource {
  volumeID: string;
  fsType: string;
  readOnly: boolean;
}

export interface CephFSVolumeSource {
  monitors: string[];
  path: string;
  user: string;
  secretFile: string;
  secretRef: LocalObjectReference;
  readonly: boolean;
}

export interface FCVolumeSource {
  targetWWNs: string[];
  lun: number;
  fsType: string;
  readOnly: boolean;
}

export interface FlockerVolumeSource { datasetName: string; }

export interface Deployment {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface DeploymentList {
  deployments: Deployment[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface RollingUpdateStrategy {
  maxSurge: (number|string);
  maxUnavailable: (number|string);
}

export interface DeploymentInfo {
  replicas: number;
  updated: number;
  available: number;
  unavailable: number;
}

export interface DeploymentDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  selector: Label[];
  statusInfo: DeploymentInfo;
  strategy: string;
  minReadySeconds: number;
  revisionHistoryLimit?: number;
  rollingUpdateStrategy?: RollingUpdateStrategy;
  oldReplicaSetList: ReplicaSetList;
  newReplicaSet: ReplicaSet;
  events: EventList;
  errors: K8sError[];
}

export interface ReplicationControllerDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  labelSelector: StringMap;
  containerImages: string[];
  initContainerImages: string[];
  podInfo: PodInfo;
  podList: PodList;
  serviceList: ServiceList;
  eventList: EventList;
  hasMetrics: boolean;
  errors: K8sError[];
}

export interface ReplicationControllerSpec { replicas: number; }

export interface ReplicaCounts {
  desiredReplicas: number;
  actualReplicas: number;
}

export interface DeleteReplicationControllerSpec { deleteServices: boolean; }

export interface Role {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export interface RoleList {
  items: Role[];
  listMeta: ListMeta;
  errors: K8sError[];
}

export interface EndpointList {
  endpoints: Endpoint[];
  listMeta: ListMeta;
}

export interface ServiceDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  internalEndpoint: Endpoint;
  externalEndpoints: Endpoint[];
  endpointList: Endpoint[];
  selector: StringMap;
  type: string;
  clusterIP: string;
  podList: PodList;
  sessionAffinity: string;
  errors: K8sError[];
}

export interface Service {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  internalEndpoint: Endpoint;
  externalEndpoints: Endpoint[];
  selector: StringMap;
  type: string;
  clusterIP: string;
}

export interface ServiceList {
  services: Service[];
  listMeta: ListMeta;
  errors: K8sError[];
}

export interface DaemonSetDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  labelSelector: StringMap;
  containerImages: string[];
  initContainerImages: string[];
  podInfo: PodInfo;
  podList: PodList;
  serviceList: ServiceList;
  hasMetrics: boolean;
  eventList: EventList;
  errors: K8sError[];
}

export interface DaemonSet {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface DaemonSetList {
  daemonSets: DaemonSet[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface Endpoint {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  host: string;
  ports: Array<{port: number, protocol: string}>;
  nodeName: string;
  port: number;
  ready: string;
}

export interface NamespaceSpec { name: string; }

export interface PodContainer {
  name: string;
  restartCount: number;
}

export interface PodContainerList { containers: string[]; }

export interface ReplicationControllerPodWithContainers {
  name: string;
  startTime?: string;
  totalRestartCount: number;
  podContainers: PodContainer[];
}

export interface ReplicationControllerPods { pods: ReplicationControllerPodWithContainers[]; }

export interface LogSources {
  podNames: string[];
  containerNames: string[];
  initContainerNames: string[];
}

export interface LogDetails {
  info: LogInfo;
  logs: LogLine[];
  selection: LogSelection;
}

export interface LogInfo {
  podName: string;
  containerName: string;
  initContainerName: string;
  fromDate: string;
  toDate: string;
  truncated: boolean;
}

export interface LogLine {
  timestamp: string;
  content: string;
}

export interface LogSelection {
  logFilePosition: string;
  referencePoint: LogLineReference;
  offsetFrom: number;
  offsetTo: number;
}

export interface LogLineReference {
  timestamp: string;
  lineNum: number;
}

export interface AppNameValiditySpec {
  name: string;
  namespace: string;
}

export interface AppNameValidity { valid: boolean; }

export interface ImageReferenceValiditySpec { reference: string; }

export interface ImageReferenceValidity {
  valid: boolean;
  reason: string;
}

export interface Protocols { protocols: string[]; }

export interface ProtocolValidity { valid: boolean; }

export interface ProtocolValiditySpec {
  protocol: string;
  isExternal: boolean;
}

export interface SecretSpec {
  name: string;
  namespace: string;
  data: string;
}

export interface Namespace {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  phase: string;
}

export interface NamespaceList {
  listMeta: ListMeta;
  namespaces: Namespace[];
  errors: K8sError[];
}

export interface NamespaceDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  phase: string;
  eventList: EventList;
  resourceLimits: LimitRange[];
  resourceQuotaList: ResourceQuotaDetailList;
  errors: K8sError[];
}

export interface SecretDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  type: string;
  data: StringMap;
}

export interface Secret {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  type: string;
}

export interface SecretList {
  secrets: Secret[];
  listMeta: ListMeta;
  errors: K8sError[];
}

export interface IngressDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export interface Ingress {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export interface IngressList {
  listMeta: ListMeta;
  items: Ingress[];
  errors: K8sError[];
}

export interface PersistentVolumeClaimDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  status: string;
  volume: string;
  capacity: string;
  storageClass: string;
  accessModes: string[];
}

export interface PersistentVolumeClaim {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  Status: string;
  Volume: string;
}

export interface PersistentVolumeClaimList {
  listMeta: ListMeta;
  items: PersistentVolumeClaim[];
  errors: K8sError[];
}

export interface LimitRange {
  resourceType: string;
  resourceName: string;
  min: string;
  max: string;
  default: string;
  defaultRequest: string;
  maxLimitRequestRatio: string;
}

export interface HorizontalPodAutoscalerDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  scaleTargetRef: ScaleTargetRef;
  minReplicas: number;
  maxReplicas: number;
  currentCPUUtilization: number;
  targetCPUUtilization?: number;
  currentReplicas: number;
  desiredReplicas: number;
  lastScaleTime: string;
}

export interface ScaleTargetRef {
  kind: string;
  name: string;
}

export interface HorizontalPodAutoscaler {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  scaleTargetRef: ScaleTargetRef;
  minReplicas: number;
  maxReplicas: number;
  currentCPUUtilization: number;
  targetCPUUtilization?: number;
}

export interface HorizontalPodAutoscalerList {
  listMeta: ListMeta;
  horizontalpodautoscalers: HorizontalPodAutoscaler[];
}

export interface StorageClass {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  provisioner: string;
  parameters: StringMap[];
}

export interface StorageClassList {
  listMeta: ListMeta;
  storageClasses: StorageClass[];
  errors: K8sError[];
}

export interface Controller {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface GlobalSettings {
  clusterName: string;
  itemsPerPage: number;
  autoRefreshTimeInterval: number;
}

export interface APIVersion { name: string; }

export interface LoginSpec {
  username: string;
  password: string;
  token: string;
  kubeConfig: string;
}

export interface AuthResponse {
  jweToken: string;
  errors: K8sError[];
}

export interface LoginStatus {
  tokenPresent: boolean;
  headerPresent: boolean;
  httpsMode: boolean;
}

export interface TokenRefreshSpec { jweToken: string; }

export interface LoginModesResponse { modes: string[]; }

export interface SupportedAuthenticationModes {
  // TODO TOKEN: AuthenticationMode;
  // TODO BASIC: AuthenticationMode;
}

export interface SystemBanner {
  message: string;
  severity: string;
}

export interface ConfigMap {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export interface ConfigMapDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  ata: StringMap;
}

export interface ConfigMapList {
  items: ConfigMap[];
  listMeta: ListMeta;
  errors: K8sError[];
}

export interface PersistentVolume {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  capacity: StringMap;
  accessModes: string[];
  reclaimPolicy: string;
  status: string;
  claim: string;
  reason: string;
}

export interface PersistentVolumeList {
  items: PersistentVolume[];
  listMeta: ListMeta;
  errors: K8sError[];
}

export interface PersistentVolumeDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  status: string;
  claim: string;
  reclaimPolicy: string;
  accessModes: string[];
  capacity: StringMap;
  message: string;
  persistentVolumeSource: PersistentVolumeSource;
}

export interface PersistentVolumeSource {
  gcePersistentDisk: GCEPersistentDiskVolumeSource;
  awsElasticBlockStore: AWSElasticBlockStorageVolumeSource;
  hostPath: HostPathVolumeSource;
  glusterfs: GlusterfsVolumeSource;
  nfs: NFSVolumeSource;
  rbd: RBDVolumeSource;
  iscsi: ISCSIVolumeSource;
  cinder: CinderVolumeSource;
  fc: FCVolumeSource;
  flocker: FlockerVolumeSource;
}

export interface Job {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
  parallelism: number;
}

export interface JobDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  podInfo: PodInfo;
  podList: PodList;
  containerImages: string[];
  initContainerImages: string[];
  eventList: EventList;
  parallelism: number;
  completions: number;
}

export interface JobList {
  jobs: Job[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface CronJob {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  schedule: string;
  suspend: boolean;
  active: number;
  lastSchedule: string;
}

export interface CronJobDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  schedule: string;
  suspend: boolean;
  active: number;
  lastSchedule: string;
  concurrencyPolicy: string;
  startingDeadlineSeconds: number;
  activeJobs: JobList;
  events: EventList;
}

export interface CronJobList {
  items: CronJob[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}

export interface StatefulSet {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  pods: PodInfo;
  containerImages: string[];
  initContainerImages: string[];
}

export interface StatefulSetDetail {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
  podInfo: PodInfo;
  podList: PodList;
  containerImages: string[];
  initContainerImages: string[];
  eventList: EventList;
  errors: K8sError[];
}

export interface StatefulSetList {
  statefulSets: StatefulSet[];
  listMeta: ListMeta;
  status: Status;
  errors: K8sError[];
}
