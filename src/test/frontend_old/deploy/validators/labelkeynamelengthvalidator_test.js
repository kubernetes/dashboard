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

import {LabelKeyNameLengthValidator} from 'deploy/validators/labelkeynamelengthvalidator';

describe('Label key name length validator', () => {
  /** @type {!LabelValuePatternValidator} */
  let labelKeyNameLengthValidator;

  beforeEach(() => {
    angular.mock.inject(() => {
      labelKeyNameLengthValidator = new LabelKeyNameLengthValidator();
    });
  });

  it('should set validity to false when key name exceeds 63 characters ', () => {
    // given
    let stringLength = 64;
    let failNameNoPrefix = (new Array(stringLength + 1).join('x'));
    let failNameWithPrefix = `validprefix.com/${failNameNoPrefix}`;
    let failKeyNames = [
      failNameNoPrefix,
      failNameWithPrefix,
    ];

    // then
    failKeyNames.forEach((failKeyName) => {
      expect(labelKeyNameLengthValidator.isValid(failKeyName)).toBeFalsy();
    });
  });

  it('should set validity to true when key name does not exceed 63 characters ', () => {
    // given
    let stringLength = 63;
    let passNameNoPrefix = (new Array(stringLength + 1).join('x'));
    let passNameWithPrefix = `validprefix.com/${passNameNoPrefix}`;
    let passKeyNames = [
      passNameNoPrefix,
      passNameWithPrefix,
    ];

    // then
    passKeyNames.forEach((passKeyName) => {
      expect(labelKeyNameLengthValidator.isValid(passKeyName)).toBeTruthy();
    });
  });
});
