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

export enum Status {
  Active = 'Active',
  Available = 'Available',
  Bound = 'Bound',
  Completed = 'Completed',
  ContainerCreating = 'ContainerCreating',
  Error = 'Error',
  Failed = 'Failed',
  Lost = 'Lost',
  Normal = 'Normal',
  NotReady = 'NotReady',
  Pending = 'Pending',
  Ready = 'Ready',
  Released = 'Released',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Suspended = 'Suspended',
  Terminating = 'Terminating',
  Terminated = 'Terminated',
  Unknown = 'Unknown',
  Waiting = 'Waiting',
  Warning = 'Warning',
}

export enum StatusClass {
  Error = 'kd-error',
  Success = 'kd-success',
  Unknown = 'kd-muted',
  Warning = 'kd-warning',
}
