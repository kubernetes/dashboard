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

import ReplicationControllerCardController from 'replicationcontrollerlist/replicationcontrollercard_controller';
import replicationControllerListModule from 'replicationcontrollerlist/replicationcontrollerlist_module';

describe('Logs menu controller', () => {
  /**
   * @type {!ReplicationControllerCardController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(replicationControllerListModule.name);

    angular.mock.inject(
        ($controller) => { ctrl = $controller(ReplicationControllerCardController); });
  });

  it('should construct details href', () => {
    // given
    ctrl.replicationController = {
      name: 'foo-name',
      namespace: 'foo-namespace',
    };

    // then
    expect(ctrl.getReplicationControllerDetailHref())
        .toEqual('#/replicationcontrollers/foo-namespace/foo-name');
  });

  it('should truncate image name', () => {
    expect(ctrl.shouldTruncate('x')).toBe(false);
    expect(ctrl.shouldTruncate('x'.repeat(32))).toBe(false);
    expect(ctrl.shouldTruncate('x'.repeat(33))).toBe(true);
    expect(ctrl.shouldTruncate('x'.repeat(100))).toBe(true);
  });

  it('should return true when all desired pods are running', () => {
    // given
    ctrl.replicationController = {
      pods: {
        running: 0,
        desired: 0,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeTruthy();
  });

  it('should return false when not all desired pods are running', () => {
    // given
    ctrl.replicationController = {
      pods: {
        running: 0,
        desired: 1,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeFalsy();
  });
});
