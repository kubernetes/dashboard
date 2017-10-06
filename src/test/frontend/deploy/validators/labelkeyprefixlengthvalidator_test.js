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

import {LabelKeyPrefixLengthValidator} from 'deploy/validators/labelkeyprefixlengthvalidator';

/**
 * key prefix (before slash) should be no longer than 253 characters.
 */
describe('Label key prefix length validator', () => {
  /** @type {!LabelKeyPrefixLengthValidator} */
  let labelKeyPrefixLengthValidator;

  beforeEach(() => {
    angular.mock.inject(() => {
      labelKeyPrefixLengthValidator = new LabelKeyPrefixLengthValidator();
    });
  });

  it('should set validity to false when key prefix (before slash) exceeds 253 characters ', () => {
    // given
    // failKey contains a 254 character prefix before slash
    let stringLength = 254;
    let failKeyPrefix = new Array(stringLength + 1).join('x');
    let failKey = `${failKeyPrefix}/validkeyname`;

    // then
    expect(labelKeyPrefixLengthValidator.isValid(failKey)).toBeFalsy();
  });

  it('should set validity to true when key prefix (before slash) is not longer than 253 characters ',
     () => {
       // given
       // passKey contains a 253 character prefix before slash
       let stringLength = 253;
       let passKeyPrefix = (new Array(stringLength + 1).join('x'));
       let passKey = `${passKeyPrefix}/validkeyname`;

       // then
       expect(labelKeyPrefixLengthValidator.isValid(passKey)).toBeTruthy();
     });
});
