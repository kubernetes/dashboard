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

export interface CsrfToken { token: string }

export interface LoginSpec { username: string, password: string, token: string, kubeconfig: string }

export interface LoginStatus { tokenPresent: boolean, headerPresent: boolean, httpsMode: boolean }

export interface AuthResponse { jweToken: string, errors: K8sError[] }

export interface GlobalSettings {
  itemsPerPage: number, clusterName: string, autoRefreshTimeInterval: number
}

export interface LocalSettings { isThemeDark: boolean }

export interface AppConfig { serverTime: number }

export interface CanIResponse { allowed: boolean }

interface StringMap {
  [name: string]: string
}

export interface ErrStatus { message: string, code: number, status: string, reason: string }

export interface K8sError { errStatus: ErrStatus }

export interface ObjectMeta {
  name: string, namespace: string, labels: StringMap, annotation: StringMap,
      creationTimestamp: string
}

export interface TypeMeta { kind: string }

export interface ListMeta { totalItems: number }

export interface Condition {
  type: string, status: string, lastProbeTime: string, lastTransitionTime: string, reason: string,
      message: string
}

export interface ConditionList { conditions: Condition[] }

export interface ContainerStateWaiting { reason: string }


export interface ContainerStateTerminated { reason: string, signal: number, exitCode: number }


export interface ContainerState {
  waiting: ContainerStateWaiting, terminated: ContainerStateTerminated
}

export interface EventList { events: Event[], listMeta: ListMeta }

export interface Event {
  objectMeta: ObjectMeta, typeMeta: TypeMeta, message: string, sourceComponent: string,
      sourceHost: string, object: string, count: number, firstSeen: string, lastSeen: string,
      reason: string, type: string
}

export interface MetricResult { timestamp: string, value: number }

export interface Metric { dataPoints: DataPoint[], metricName: string, aggregation: string }

export interface DataPoint { x: number, y: number }

export interface PodMetrics {
  cpuUsage: number, memoryUsage: number, cpuUsageHistory: MetricResult[],
      memoryUsageHistory: MetricResult[]
}

export interface Status { running: number, failed: number, pending: number, succeeded: number }

export interface PodStatus { podPhase: string, status: string, containerStates: ContainerState[] }

export interface PodInfo {
  current: number, desired: number, running: number, pending: number, failed: number,
      succeeded: number, warnings: Event[]
}

export interface Pod {
  objectMeta: ObjectMeta, typeMeta: TypeMeta, podStatus: PodStatus, podIP: string,
      restartCount: number, qosClass: string, metrics: PodMetrics, warnings: Event[],
      nodeName: string
}

export interface PodList {
  pods: Pod;
  listMeta: ListMeta, status: Status, podInfo: PodInfo, cumulativeMetrics: Metric[]|null,
      errors: K8sError[]
}

export interface NodeAllocatedResources {
  cpuRequests: number, cpuRequestsFraction: number, cpuLimits: number, cpuLimitsFraction: number,
      cpuCapacity: number, memoryRequests: number, memoryRequestsFraction: number,
      memoryLimits: number, memoryLimitsFraction: number, memoryCapacity: number,
      allocatedPods: number, podCapacity: number, podFraction: number
}

export interface NodeInfo {
  machineID: string, systemUUID: string, bootID: string, kernelVersion: string, osImage: string,
      containerRuntimeVersion: string, kubeletVersion: string, kubeProxyVersion: string,
      operatingSystem: string, architecture: string
}

export interface NodeAddress { type: string, address: string }

export interface NodeDetail {
  objectMeta: ObjectMeta, typeMeta: TypeMeta, phase: string, podCIDR: string, providerID: string,
      unschedulable: boolean, allocatedResources: NodeAllocatedResources, nodeInfo: NodeInfo,
      containerImages: string[], initContainerImages: string[], addresses: NodeAddress,
      conditions: ConditionList, podList: PodList, eventList: EventList, errors: K8sError[]
}

export interface Node { objectMeta: ObjectMeta, typeMeta: TypeMeta, ready: string }

export interface NodeList { nodes: Node[], listMeta: ListMeta, errors: K8sError[] }
