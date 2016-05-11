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

import resourceModule from 'common/resource/resource_module';

describe('Verber service', () => {
  /** @type !{!common/resource/verber_service.VerberService} */
  let verber;
  /** @type {!md.$dialog} */
  let mdDialog;

  beforeEach(() => angular.mock.module(resourceModule.name));

  beforeEach(angular.mock.inject((kdResourceVerberService, $mdDialog) => {
    verber = kdResourceVerberService;
    mdDialog = $mdDialog;
  }));

  it('should show delete dialog resource', () => {
    let promise = {};
    spyOn(mdDialog, 'show').and.returnValue(promise);
    let actual = verber.showDeleteDialog('Foo resource', {foo: 'bar'}, {baz: 'qux'});
    expect(mdDialog.show).toHaveBeenCalledWith(jasmine.objectContaining({
      locals: {
        'resourceKindName': 'Foo resource',
        'typeMeta': {foo: 'bar'},
        'objectMeta': {baz: 'qux'},
      },
    }));
    expect(actual).toBe(promise);
  });
});
