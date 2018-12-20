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

import componentsModule from 'common/components/module';
import {kdLocalizedErrors} from 'common/errorhandling/errors';
import errorModule from 'common/errorhandling/module';

describe('Warnings component', () => {
  /** @type {!WarningsController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(errorModule.name);
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController, localizerService) => {
      ctrl = $componentController('kdWarnings', {localizerService: localizerService}, {});
    });
  });

  it('should return localized error message', () => {
    // when
    let msg = ctrl.getLocalizedMessage('MSG_LOGIN_UNAUTHORIZED_ERROR');

    // then
    expect(msg).toBe(kdLocalizedErrors.MSG_LOGIN_UNAUTHORIZED_ERROR);
  });
});
