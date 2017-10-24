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

import {WorkloadsController} from 'workloads/controller';
import workloadListModule from 'workloads/module';

describe('Workload list controller', () => {
  /** @type {!workloads/controller.WorkloadsController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(workloadListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(WorkloadsController, {workloads: {workloads: []}});
    });
  });

  it('should initialize workloads', angular.mock.inject(($controller) => {
    let workloads = {workloads: 'foo-bar'};
    /** @type {!WorkloadsController} */
    let ctrl = $controller(WorkloadsController, {workloads: workloads});

    expect(ctrl.workloads).toBe(workloads);
  }));

  it('should show zero state', () => {
    // given
    ctrl.workloads = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
    };

    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.workloads = {
      deploymentList: {listMeta: {totalItems: 1}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
