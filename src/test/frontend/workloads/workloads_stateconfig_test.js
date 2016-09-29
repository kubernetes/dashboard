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

import workloadListModule from 'workloads/workloads_module';
import {resolveWorkloads} from 'workloads/workloads_stateconfig';

describe('StateConfig for workload list', () => {
  /** @type {!common/pagination/pagination_service.PaginationService} */
  let kdPaginationService;

  beforeEach(() => {
    angular.mock.module(workloadListModule.name);
    angular.mock.inject((_kdPaginationService_) => {
      kdPaginationService = _kdPaginationService_;
    });
  });

  it('should resolve workloads with no namespace', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpyObj('$resource', ['get']);
    resource.get.and.callFake(function() {
      return {$promise: promise};
    });

    let actual = resolveWorkloads(resource, {}, kdPaginationService);

    expect(resource.get).toHaveBeenCalledWith(kdPaginationService.getDefaultResourceQuery(''));
    expect(actual).toBe(promise);
  }));

  it('should resolve workloads', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpyObj('$resource', ['get']);
    resource.get.and.callFake(function() {
      return {$promise: promise};
    });

    let actual = resolveWorkloads(resource, {namespace: 'foo'}, kdPaginationService);

    expect(resource.get).toHaveBeenCalledWith(kdPaginationService.getDefaultResourceQuery('foo'));
    expect(actual).toBe(promise);
  }));
});
