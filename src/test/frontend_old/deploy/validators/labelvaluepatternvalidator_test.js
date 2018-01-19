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

import {LabelValuePatternValidator} from 'deploy/validators/labelvaluepatternvalidator';

/**
 * RegExp for Value: (([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?
 * checks that value matches: an empty string or a string using
 * upper- and/or lowercase alphanumeric characters separated by ".", "-" or "_"
 */
describe('Label Value Pattern Validator', () => {
  /** @type {!LabelValuePatternValidator} */
  let labelValuePatternValidator;

  beforeEach(() => {
    angular.mock.inject(() => {
      labelValuePatternValidator = new LabelValuePatternValidator();
    });
  });

  it('should set validity to false when value does not conform to RegExp', () => {
    // given
    let failValues = [
      '.dotAtStart',
      'dotAtEnd.',
      '-dashAtStart',
      'dashAtEnd_',
      '_underscoreAtStart',
      'underscoreAtEnd_',
      'illegal#Character',
      'illegal$Character',
      'ąćęłńóśźż北京市',
      'space in name',
    ];
    failValues.forEach((failValue) => {
      // then
      expect(labelValuePatternValidator.isValid(failValue)).toBeFalsy();
    });
  });

  it('should set validity to true when value conforms to RegExp ', () => {
    // given
    let passValues = [
      'validvalue',
      'validValueCamel',
      'ValidValuePascal',
      'VALIDALLCAPS',
      'valid.dot',
      'valid-dash',
      'valid_underscore',
      '0valid12numbers3',
    ];
    passValues.forEach((passValue) => {
      // then
      expect(labelValuePatternValidator.isValid(passValue)).toBeTruthy();
    });
  });
});
