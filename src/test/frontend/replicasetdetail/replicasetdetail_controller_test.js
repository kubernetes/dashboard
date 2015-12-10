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

import ReplicaSetDetailController from 'replicasetdetail/replicasetdetail_controller';
import replicaSetDetailModule from 'replicasetdetail/replicasetdetail_module';

describe('Replica Set Detail controller', () => {
  /**
   * Replica Set Detail controller.
   * @type {!ReplicaSetDetailController}
   */
  let ctrl;

  /** @type {!md.$dialog} */
  let mdDialog;

  beforeEach(() => {
    angular.mock.module(replicaSetDetailModule.name);

    angular.mock.inject(($resource, $log, $state, $mdDialog) => {
      mdDialog = $mdDialog;
      ctrl = new ReplicaSetDetailController(mdDialog, $state, $resource, $log, [], [], []);
    });
  });

  it('should not filter any events if all option is selected', () => {
    // given
    let eventType = 'All';
    let events = [
      {
        type: "Warning",
        message: "event-1",
      },
      {
        type: "Normal",
        message: "event-2",
      },
    ];

    // when
    let result = ctrl.filterByType(events, eventType);

    // then
    expect(result.length).toEqual(2);
  });

  it('should filter all non-warning events if warning option is selected', () => {
    // given
    let eventType = 'Warning';
    let events = [
      {
        type: "Warning",
        message: "event-1",
      },
      {
        type: "Normal",
        message: "event-2",
      },
      {
        type: "Normal",
        message: "event-3",
      },
    ];

    // when
    let result = ctrl.filterByType(events, eventType);

    // then
    expect(result.length).toEqual(1);
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.replicaSetDetail = {
      pods: [],
    };
    spyOn(mdDialog, 'show');

    // when
    ctrl.handleUpdateReplicasDialog();

    // then
    expect(mdDialog.show).toHaveBeenCalled();
  });
});
