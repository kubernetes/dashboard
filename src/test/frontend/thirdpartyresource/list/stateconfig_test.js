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

import {resolveThirdPartyResourceList} from 'thirdpartyresource/list/stateconfig';
import thirdPartyResourceModule from 'thirdpartyresource/module';

describe('StateConfig for third party resource controller list', () => {
  /** @type {!PaginationService} */
  let kdPaginationService;

  beforeEach(() => {
    angular.mock.module(thirdPartyResourceModule.name);
    angular.mock.inject((_kdPaginationService_) => {
      kdPaginationService = _kdPaginationService_;
    });
  });

  it('should resolve third party resource list', angular.mock.inject(($q) => {
    let promise = $q.defer().promise;

    let resource = jasmine.createSpyObj('$resource', ['get']);
    resource.get.and.callFake(function() {
      return {$promise: promise};
    });

    let actual = resolveThirdPartyResourceList(resource, kdPaginationService);

    expect(resource.get).toHaveBeenCalledWith(kdPaginationService.getDefaultResourceQuery(''));
    expect(actual).toBe(promise);
  }));
});
