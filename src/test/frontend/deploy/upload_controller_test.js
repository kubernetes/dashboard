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

import {UploadController} from 'deploy/upload_controller.js';

describe('Upload Controller', () => {
  /** @type {!UploadController} */
  let ctrl;
  /** @type {!angular.FormController} */
  let form;

  beforeEach(() => {
    angular.mock.inject(($controller) => {
      form = {
        $submitted: false,
        fileName: {
          $invalid: false,
          $error: {
            required: false,
          },
        },
      };
      ctrl = $controller(UploadController, {/* no locals */}, {form: form});
    });
  });

  it('should return false when the from is not submitted and there is no error', () => {
    // when
    let result = ctrl.isFileNameError();

    // then
    expect(result).toEqual(false);
  });

  it('should return false when the from is not submitted and there is an error', () => {
    // given
    form.fileName.$error.required = true;

    // when
    let result = ctrl.isFileNameError();

    // then
    expect(result).toEqual(false);
  });

  it('should return true when the from is submitted and there is an error', () => {
    // given
    form.fileName.$error.required = true;
    form.$submitted = true;

    // when
    let result = ctrl.isFileNameError();

    // then
    expect(result).toEqual(false);
  });

});
