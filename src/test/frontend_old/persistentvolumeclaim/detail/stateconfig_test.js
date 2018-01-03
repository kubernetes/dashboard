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

import {getPersistentVolumeClaimDetail, getPersistentVolumeClaimDetailResource} from 'persistentvolumeclaim/detail/stateconfig';
import persistentVolumeClaimModule from 'persistentvolumeclaim/module';

describe('StateConfig for persistent volume claim detail', () => {
  beforeEach(() => {
    angular.mock.module(persistentVolumeClaimModule.name);
  });

  it('should resolve persistent volume claim', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpy('$resource');
    let resourceObject = {
      get: jasmine.createSpy('get'),
    };
    resource.and.returnValue(resourceObject);
    resourceObject.get.and.returnValue({$promise: promise});
    let actual = getPersistentVolumeClaimDetailResource(
        resource, {objectNamespace: 'foo', objectName: 'bar'});

    expect(resource).toHaveBeenCalledWith('api/v1/persistentvolumeclaim/foo/bar');

    let detail = getPersistentVolumeClaimDetail(actual);

    expect(detail).toBe(promise);
  }));
});
