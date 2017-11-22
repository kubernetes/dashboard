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

import {OverviewController} from 'overview/controller';
import overviewListModule from 'overview/module';

describe('Overview list controller', () => {
  /** @type {!/controller.OverviewController} */
  let ctrl;

  let getStatus = (running, failed, pending, succedded) => {
    return {
      running: running,
      failed: failed,
      pending: pending,
      succedded: succedded,
    };
  };

  beforeEach(() => {
    angular.mock.module(overviewListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(OverviewController, {overview: {overview: []}});
    });
  });

  it('should initialize all objects', angular.mock.inject(($controller) => {
    let overview = {overview: 'foo-bar'};
    /** @type {!OverviewController} */
    let ctrl = $controller(OverviewController, {overview: overview});

    expect(ctrl.overview).toBe(overview);
  }));

  it('should init resource ratio', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: [], status: getStatus(0, 0, 0, 0)},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: [], status: getStatus(0, 0, 0, 0)},
      jobList: {listMeta: {totalItems: 0}, jobs: [], status: getStatus(0, 0, 0, 0)},
      cronJobList: {listMeta: {totalItems: 0}, items: [], status: getStatus(0, 0, 0, 0)},
      replicationControllerList:
          {listMeta: {totalItems: 0}, replicationControllers: [], status: getStatus(0, 0, 0, 0)},
      podList: {listMeta: {totalItems: 0}, pods: [], status: getStatus(0, 0, 0, 0)},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: [], status: getStatus(0, 0, 0, 0)},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: [], status: getStatus(0, 0, 0, 0)},
      serviceList: {listMeta: {totalItems: 0}, status: getStatus(0, 0, 0, 0)},
      ingressList: {listMeta: {totalItems: 0}, status: getStatus(0, 0, 0, 0)},
      secretList: {listMeta: {totalItems: 0}, status: getStatus(0, 0, 0, 0)},
      configMapList: {listMeta: {totalItems: 0}, status: getStatus(0, 0, 0, 0)},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}, status: getStatus(0, 0, 0, 0)},
    };

    // when
    ctrl.$onInit();

    // then
    expect(Object.keys(ctrl.resourcesRatio).length).toBeGreaterThan(0);
  });

  it('should show zero state', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 0}},
      secretList: {listMeta: {totalItems: 0}},
      configMapList: {listMeta: {totalItems: 0}},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should show workload statuses', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 1}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
    };

    expect(ctrl.shouldShowWorkloadsSection()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 1}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 0}},
      secretList: {listMeta: {totalItems: 0}},
      configMapList: {listMeta: {totalItems: 0}},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });

  it('should hide workload statuses', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      cronJobList: {listMeta: {totalItems: 0}, items: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
    };

    expect(ctrl.shouldShowWorkloadsSection()).toBeFalsy();
  });

  it('should get suspendable resource ratio', () => {
    // given
    let status = {running: 2, failed: 3};
    let total = 5;

    // when
    let ratio = ctrl.getSuspendableResourceRatio(status, total);

    // then
    expect(ratio).toEqual([
      {key: 'Running: 2', value: 40},
      {key: 'Suspended: 3', value: 60},
    ]);
  });

  it('should get default resource ratio', () => {
    // given
    let status = {running: 2, failed: 3, pending: 0};
    let total = 5;

    // when
    let ratio = ctrl.getDefaultResourceRatio(status, total);

    // then
    expect(ratio).toEqual([
      {key: 'Running: 2', value: 40},
      {key: 'Failed: 3', value: 60},
      {key: 'Pending: 0', value: 0},
    ]);
  });

  it('should get completable resource ratio', () => {
    // given
    let status = {running: 2, failed: 3, pending: 0, succeeded: 0};
    let total = 5;

    // when
    let ratio = ctrl.getCompletableResourceRatio(status, total);

    // then
    expect(ratio).toEqual([
      {key: 'Running: 2', value: 40},
      {key: 'Failed: 3', value: 60},
      {key: 'Pending: 0', value: 0},
      {key: 'Succeeded: 0', value: 0},
    ]);
  });
});
