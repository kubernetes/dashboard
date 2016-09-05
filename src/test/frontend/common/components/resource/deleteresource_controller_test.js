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

import {DeleteResourceController} from 'common/resource/deleteresource_controller';
import resourceModule from 'common/resource/resource_module';

describe('Delete resource controller', () => {
  /** @type !{!common/resource/deleteresource_controller.DeleteResourceController} */
  let ctrl;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => angular.mock.module(resourceModule.name));

  beforeEach(angular.mock.inject(($controller, $mdDialog, $httpBackend) => {
    ctrl = $controller(DeleteResourceController, {
      resourceKindName: 'My Resource',
      objectMeta: {name: 'Foo', namespace: 'Bar'},
      typeMeta: {kind: 'qux'},
    });
    mdDialog = $mdDialog;
    httpBackend = $httpBackend;
  }));

  it('should delete resource', () => {
    spyOn(mdDialog, 'hide');
    ctrl.remove();
    httpBackend.expectDELETE('api/v1/qux/namespace/Bar/name/Foo').respond(200, {ok: 'ok'});
    httpBackend.flush();
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should propagate errors on delete', () => {
    spyOn(mdDialog, 'cancel');
    ctrl.remove();
    httpBackend.expectDELETE('api/v1/qux/namespace/Bar/name/Foo').respond(500, {err: 'err'});
    httpBackend.flush();
    expect(mdDialog.cancel).toHaveBeenCalled();
  });

  it('should cancel', () => {
    spyOn(mdDialog, 'cancel');
    ctrl.cancel();
    expect(mdDialog.cancel).toHaveBeenCalled();
  });
});
