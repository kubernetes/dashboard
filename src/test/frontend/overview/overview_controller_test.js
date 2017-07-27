// Copyright 2017 The Kubernetes Dashboard Authors.
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

  it('should show zero state', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
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

  it('should hide zero state', () => {
    // given
    ctrl.overview = {
      deploymentList: {listMeta: {totalItems: 1}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
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
});
