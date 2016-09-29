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

  it('should hide status when no error', () => {
    expect(ctrl.showStatus()).toBe(false);
  });

  it('should hide status when there is unknown error', () => {
    // given
    stateParams.error.status = -1;

    // then
    expect(ctrl.showStatus()).toBe(false);
  });

  it('should show status when there known error', () => {
    // given
    stateParams.error.status = 404;

    // then
    expect(ctrl.showStatus()).toBe(true);
  });
});
