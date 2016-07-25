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

import {PaginationService} from 'common/pagination/pagination_service';

import secretListModule from 'secretlist/secretlist_module';
import {resolveSecretList} from 'secretlist/secretlist_stateconfig';

describe('StateConfig for secret list', () => {
  beforeEach(() => { angular.mock.module(secretListModule.name); });

  it('should resolve secrets with', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpyObj('$resource', ['get']);
    resource.get.and.callFake(function() { return {$promise: promise}; });

    let actual = resolveSecretList(resource, {namespace: 'foo'});

    expect(resource.get).toHaveBeenCalledWith(PaginationService.getDefaultResourceQuery('foo'));
    expect(actual).toBe(promise);
  }));

  it('should resolve secrets with no namespace', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpyObj('$resource', ['get']);
    resource.get.and.callFake(function() { return {$promise: promise}; });

    let actual = resolveSecretList(resource, {});

    expect(resource.get).toHaveBeenCalledWith(PaginationService.getDefaultResourceQuery(''));
    expect(actual).toBe(promise);
  }));
});
