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

import {SearchController} from 'search/controller';
import searchModule from 'search/module';

describe('Search list controller', () => {
  /** @type {!search/controller.SearchController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(searchModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(SearchController, {search: {search: []}});
    });
  });

  it('should initialize search', angular.mock.inject(($controller) => {
    let search = {search: 'foo-bar'};
    /** @type {!SearchController} */
    let ctrl = $controller(SearchController, {search: search});

    expect(ctrl.search).toBe(search);
  }));

  it('should show zero state', () => {
    // given
    ctrl.search = {
      deploymentList: {listMeta: {totalItems: 0}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
      nodeList: {listMeta: {totalItems: 0}, statefulSets: []},
      namespaceList: {listMeta: {totalItems: 0}, namespaces: []},
      persistentVolumeList: {listMeta: {totalItems: 0}, persistentVolumes: []},
      storageClassList: {listMeta: {totalItems: 0}, storageClasses: []},
      secretList: {listMeta: {totalItems: 0}, secrets: []},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}, persistentVolumeClaims: []},
      configMapList: {listMeta: {totalItems: 0}, configMaps: []},
      serviceList: {listMeta: {totalItems: 0}, services: []},
      ingressList: {listMeta: {totalItems: 0}, ingresses: []},
    };

    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.search = {
      deploymentList: {listMeta: {totalItems: 1}, deployments: []},
      replicaSetList: {listMeta: {totalItems: 0}, replicaSets: []},
      jobList: {listMeta: {totalItems: 0}, jobs: []},
      replicationControllerList: {listMeta: {totalItems: 0}, replicationControllers: []},
      podList: {listMeta: {totalItems: 0}, pods: []},
      daemonSetList: {listMeta: {totalItems: 0}, daemonSets: []},
      statefulSetList: {listMeta: {totalItems: 0}, statefulSets: []},
      nodeList: {listMeta: {totalItems: 0}, statefulSets: []},
      namespaceList: {listMeta: {totalItems: 0}, namespaces: []},
      persistentVolumeList: {listMeta: {totalItems: 0}, persistentVolumes: []},
      storageClassList: {listMeta: {totalItems: 0}, storageClasses: []},
      secretList: {listMeta: {totalItems: 0}, secrets: []},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}, persistentVolumeClaims: []},
      configMapList: {listMeta: {totalItems: 0}, configMaps: []},
      serviceList: {listMeta: {totalItems: 0}, services: []},
      ingressList: {listMeta: {totalItems: 0}, ingresses: []},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
