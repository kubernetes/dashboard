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

import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';

describe('Replication controller service', () => {
  /** @type {!ReplicationControllerService} */
  let service;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$q} */

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject((kdReplicationControllerService, $mdDialog) => {
      service = kdReplicationControllerService;
      mdDialog = $mdDialog;
    });
  });

  it('should show edit replicas dialog', () => {
    // given
    let namespace = 'foo-namespace';
    let replicationController = 'foo-name';
    let currentPods = 3;
    spyOn(mdDialog, 'show');

    // when
    service.showUpdateReplicasDialog(namespace, replicationController, currentPods, currentPods);

    // then
    expect(mdDialog.show).toHaveBeenCalled();
  });
});
