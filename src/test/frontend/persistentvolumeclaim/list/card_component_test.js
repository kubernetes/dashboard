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

import persistentVolumeClaimModule from 'persistentvolumeclaim/module';

describe('Persistent Volume Claim card', () => {
  /** @type {!PersistentVolumeClaimCardController} */
  let ctrl;
  /**
   * @type {!NamespaceService}
   */
  let data;

  beforeEach(() => {
    angular.mock.module(persistentVolumeClaimModule.name);

    angular.mock.inject(($componentController, $rootScope, kdNamespaceService) => {

      /** @type {!PersistentVolumeClaimCardController} */
      ctrl = $componentController('kdPersistentVolumeClaimCard', {$scope: $rootScope});
      /** @type {!NamespaceService} */
      data = kdNamespaceService;
    });
  });

  it('should return true when persistent volume claim is bound', () => {
    // given
    ctrl.persistentVolumeClaim = {
      status: 'Bound',
    };

    // then
    expect(ctrl.isBound()).toBeTruthy();
  });

  it('should return true when persistent volume claim is pending', () => {
    // given
    ctrl.persistentVolumeClaim = {
      status: 'Pending',
    };

    // then
    expect(ctrl.isPending()).toBeTruthy();
  });

  it('should return true when persistent volume claim is lost', () => {
    // given
    ctrl.persistentVolumeClaim = {
      status: 'Lost',
    };

    // then
    expect(ctrl.isLost()).toBeTruthy();
  });

  it('should get details href', () => {
    ctrl.persistentVolumeClaim = {
      objectMeta: {
        namespace: 'foo',
        name: 'bar',
      },
    };

    expect(ctrl.getPersistentVolumeClaimDetailHref()).toBe('#!/persistentvolumeclaim/foo/bar');
  });

  it('should return the value from Namespace service', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(data.areMultipleNamespacesSelected());
  });
});
