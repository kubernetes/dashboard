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

import deploymentListModule from 'deploymentlist/deploymentlist_module';
import {resolveDeploymentList} from 'deploymentlist/deploymentlist_stateconfig';

describe('StateConfig for deployment list', () => {
  beforeEach(() => { angular.mock.module(deploymentListModule.name); });

  it('should resolve deployments', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpy('$resource');
    resource.and.returnValue({get: function() { return {$promise: promise}; }});

    let actual = resolveDeploymentList(resource, {namespace: 'foo'});

    expect(resource).toHaveBeenCalledWith('api/v1/deployment/foo');
    expect(actual).toBe(promise);
  }));

  it('should resolve deployments with no namespace', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpy('$resource');
    resource.and.returnValue({get: function() { return {$promise: promise}; }});

    let actual = resolveDeploymentList(resource, {});

    expect(resource).toHaveBeenCalledWith('api/v1/deployment/');
    expect(actual).toBe(promise);
  }));
});
