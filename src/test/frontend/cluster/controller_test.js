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

import {ClusterController} from 'cluster/controller';
import module from 'cluster/module';

describe('Cluster list controller', () => {
  /** @type {!cluster/controller.ClusterController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(ClusterController, {cluster: {cluster: []}});
    });
  });

  it('should initialize cluster', angular.mock.inject(($controller) => {
    let cluster = {cluster: 'foo-bar'};
    /** @type {!ClusterController} */
    let ctrl = $controller(ClusterController, {cluster: cluster});

    expect(ctrl.cluster).toBe(cluster);
  }));

  it('should show zero state', () => {
    // given
    ctrl.cluster = {
      nodeList: {listMeta: {totalItems: 0}},
      namespaceList: {listMeta: {totalItems: 0}},
      persistentVolumeList: {listMeta: {totalItems: 0}},
      roleList: {listMeta: {totalItems: 0}},
      storageClassList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.cluster = {
      nodeList: {listMeta: {totalItems: 1}},
      namespaceList: {listMeta: {totalItems: 0}},
      persistentVolumeList: {listMeta: {totalItems: 0}},
      roleList: {listMeta: {totalItems: 0}},
      storageClassList: {listMeta: {totalItems: 0}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
