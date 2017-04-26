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

import replicaSetModule from 'replicaset/module';

describe('Replica Set card', () => {
  /** @type {!ReplicaSetCardController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(replicaSetModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdReplicaSetCard', {$scope: $rootScope});
    });
  });

  it('should construct details href', () => {
    // given
    ctrl.replicaSet = {
      objectMeta: {
        name: 'foo-name',
        namespace: 'foo-namespace',
      },
    };

    // then
    expect(ctrl.getReplicaSetDetailHref()).toEqual('#!/replicaset/foo-namespace/foo-name');
  });

  it('should return true when at least one replica set controller pod has warning', () => {
    // given
    ctrl.replicaSet = {
      pods: {
        warnings: [
          {
            message: 'test-error',
            reason: 'test-reason',
          },
        ],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBeTruthy();
  });

  it('should return false when there are no errors related to replica set controller pods', () => {
    // given
    ctrl.replicaSet = {
      pods: {
        warnings: [],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBe(false);
    expect(ctrl.isSuccess()).toBe(true);
  });

  it('should return true when there are no warnings and at least one pod is in pending state',
     () => {
       // given
       ctrl.replicaSet = {
         pods: {
           warnings: [],
           pending: 1,
         },
       };

       // then
       expect(ctrl.isPending()).toBe(true);
       expect(ctrl.isSuccess()).toBe(false);
     });

  it('should return false when there is warning related to replica set controller pods', () => {
    // given
    ctrl.replicaSet = {
      pods: {
        warnings: [
          {
            message: 'test-error',
            reason: 'test-reason',
          },
        ],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBe(true);
    expect(ctrl.isPending()).toBe(false);
    expect(ctrl.isSuccess()).toBe(false);
  });

  it('should return false when there are no warnings and there is no pod in pending state', () => {
    // given
    ctrl.replicaSet = {
      pods: {
        warnings: [],
        pending: 0,
      },
    };

    // then
    expect(ctrl.isPending()).toBe(false);
    expect(ctrl.isSuccess()).toBe(true);
  });

  it('should format the "created at" tooltip correctly', () => {
    expect(ctrl.getCreatedAtTooltip('2016-06-06T09:13:12Z'))
        .toMatch('Created at 2016-06-06T09:13.*');
  });
});
