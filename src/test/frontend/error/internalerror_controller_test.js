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

import errorModule from 'error/error_module';
import {InternalErrorController} from 'error/internalerror_controller';
import {StateParams} from 'error/internalerror_state';

describe('Internal error controller', () => {
  /** @type {!InternalErrorController} */
  let ctrl;
  /** @type {!StateParams} */
  let stateParams;

  beforeEach(() => {
    angular.mock.module(errorModule.name);

    angular.mock.inject(($controller) => {
      stateParams = new StateParams({status: undefined});
      ctrl = $controller(InternalErrorController, {$stateParams: stateParams});
    });
  });

  it('should return default error status when unknown error', () => {
    expect(ctrl.getErrorStatus()).toBe(ctrl.i18n.MSG_UNKNOWN_SERVER_ERROR);
  });

  it('should return valid error status when error occurs', () => {
    // given
    stateParams.error.status = 500;

    // then
    expect(ctrl.getErrorStatus())
        .toBe(`${ctrl.i18n.MSG_UNKNOWN_SERVER_ERROR} (${stateParams.error.status})`);
  });

  it('should return valid error status when error occurs', () => {
    // given
    stateParams.error.status = 500;
    stateParams.error.statusText = 'Random error';

    // then
    expect(ctrl.getErrorStatus())
        .toBe(`${stateParams.error.statusText} (${stateParams.error.status})`);
  });

  it('should return valid error status when error occurs', () => {
    // given
    stateParams.error.statusText = 'Random error';

    // then
    expect(ctrl.getErrorStatus()).toBe(`${stateParams.error.statusText}`);
  });

  it('should return default error data when unknown error', () => {
    expect(ctrl.getErrorData()).toBe(ctrl.i18n.MSG_NO_ERROR_DATA);
  });

  it('should return default error data when empty error', () => {
    // given
    stateParams.error.data = '';

    // then
    expect(ctrl.getErrorData()).toBe(ctrl.i18n.MSG_NO_ERROR_DATA);
  });

  it('should return valid error data when error occurs', () => {
    // given
    stateParams.error.data = 'something is broken';

    // then
    expect(ctrl.getErrorData()).toBe(stateParams.error.data);
  });
});
