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

import {LabelKeyNamePatternValidator} from 'deploy/validators/labelkeynamepatternvalidator';

/**
 * RegExp for Key Name: ([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]
 * checks that key name (whatever is after the slash if there is one
 * or the whole word if there is no slash) matches:
 * beginning and ending with upper or lowercase alphanumeric characters
 * separated by '.', '_', '-' only.
 */
describe('Label Key Name Pattern validator', () => {
  /** @type {!LabelKeyNamePatternValidator} */
  let labelKeyNamePatternValidator;

  beforeEach(() => {
    angular.mock.inject(() => {
      labelKeyNamePatternValidator = new LabelKeyNamePatternValidator();
    });
  });

  it('should set validity to false when key name does not conform to RegExp', () => {
    // given
    let failKeyNames = [
      'no-key-name-after-slash/',
      '-dash-at-beginning',
      'dash-at-end-',
      '_underscore_at_beginning',
      'underscore_at_end_',
      '.dot.at.beginning',
      'dot.at.end.',
      'more/than/one/slash',
      'illegal$character',
      'illegal@character',
    ];

    failKeyNames.forEach((failKeyName) => {
      // then
      expect(labelKeyNamePatternValidator.isValid(failKeyName)).toBeFalsy();
    });
  });

  it('should set validity to true when key name conforms to RegExp', () => {
    // given
    let passKeyNames = [
      'prefix/key',
      'key',
      'key.dot',
      'key-dash',
      'key_underscore',
      'KeyCapital',
    ];

    passKeyNames.forEach((passKeyName) => {
      // then
      expect(labelKeyNamePatternValidator.isValid(passKeyName)).toBeTruthy();
    });
  });
});
