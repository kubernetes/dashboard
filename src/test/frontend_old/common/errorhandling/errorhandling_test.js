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

import {isError, kdErrors} from 'common/errorhandling/errors';
import errorhandlingModule from 'common/errorhandling/module';

describe('Errorhandling service', () => {
  /** @type {!ErrorDialog} */
  let errorDialog;
  /** @type {!md.$dialog} */
  let mdDialog;

  beforeEach(() => {
    angular.mock.module(errorhandlingModule.name);
    angular.mock.inject(($mdDialog, _errorDialog_) => {
      errorDialog = _errorDialog_;
      mdDialog = $mdDialog;
    });
  });

  it('should show error title and error message in the md dialog', () => {
    spyOn(mdDialog, 'show');
    /** @type {string} */
    let errorTitle = 'Error title';
    /** @type {string} */
    let errorMessage = 'Error message';
    // open the error dialog
    errorDialog.open(errorTitle, errorMessage);
    // and expect it to show
    expect(mdDialog.show).toHaveBeenCalled();
  });
});

describe('Errorhandling', () => {
  it('should return true when error message matches one of the provided errors', () => {
    // given
    let errMsg = 'MSG_ENCRYPTION_KEY_CHANGED';

    // when
    let result = isError(errMsg, kdErrors.TOKEN_EXPIRED, kdErrors.ENCRYPTION_KEY_CHANGED);

    // then
    expect(result).toBeTruthy();
  });

  it('should return false when error message does not match on of the provided errors', () => {
    // given
    let errMsg = 'MSG_ENCRYPTION_KEY_CHANGED';

    // when
    let result = isError(errMsg, kdErrors.TOKEN_EXPIRED);

    // then
    expect(result).toBeFalsy();
  });
});
