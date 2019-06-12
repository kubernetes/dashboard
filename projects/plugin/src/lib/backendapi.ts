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

// Shared resource types
export interface KdError {
  status: string;
  code: number;
  message: string;

  localize(): KdError;
}

export interface TypeMeta {
  kind: string;
}

export interface ListMeta {
  totalItems: number;
}

export interface ObjectMeta {
  name?: string;
  namespace?: string;
  labels?: StringMap;
  annotations?: StringMap;
  creationTimestamp?: string;
  uid?: string;
}



export interface ResourceList {
  listMeta: ListMeta;
  items?: Resource[];
  errors?: K8sError[];
}

export interface Resource {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export interface PodList extends ResourceList {
  pods: Pod[];
  status: Status;
  podInfo?: PodInfo;
  cumulativeMetrics: Metric[]|null;
}

// Simple detail types
export interface Pod extends Resource {
  podStatus: PodStatus;
  podIP?: string;
  restartCount: number;
  qosClass?: string;
  metrics: PodMetrics;
  warnings: Event[];
  nodeName: string;
}

interface StringMap {
  [key: string]: string;
}

export interface ErrStatus {
  message: string;
  code: number;
  status: string;
  reason: string;
}

/* tslint:disable */
export interface K8sError {
  ErrStatus: ErrStatus;

  toKdError(): KdError;
}
/* tslint:enable */

export interface ContainerStateWaiting {
  reason: string;
}

export interface ContainerStateRunning {
  startedAt: string;
}

export interface ContainerStateTerminated {
  reason: string;
  signal: number;
  exitCode: number;
}

export interface ContainerState {
  waiting?: ContainerStateWaiting;
  terminated?: ContainerStateTerminated;
  running?: ContainerStateRunning;
}

export interface ResourceQuotaStatus {
  used: string;
  hard: string;
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

