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

import {LabelKeyPrefixLengthType} from 'common/validators/types/labelkeyprefixlengthtype';

/**
 * key prefix (before slash) should be no longer than 253 characters.
 */
describe('Label key prefix length type', () => {
  /** @type {!LabelKeyPrefixLengthType} */
  let labelKeyPrefixLengthType;

  beforeEach(() => {
    angular.mock.inject(() => { labelKeyPrefixLengthType = new LabelKeyPrefixLengthType(); });
  });

  it('should set validity to false when key prefix (before slash) exceeds 253 characters ', () => {
    // given
    // failKey contains a 254 character prefix before slash
    let stringLength = 254;
    let failKeyPrefix = new Array(stringLength + 1).join('x');
    let failKey = `${failKeyPrefix}/validkeyname`;

    // then
    expect(labelKeyPrefixLengthType.isValid(failKey)).toBeFalsy();
  });

  it('should set validity to true when key prefix (before slash) is not longer than 253 characters ',
     () => {
       // given
       // passKey contains a 253 character prefix before slash
       let stringLength = 253;
       let passKeyPrefix = (new Array(stringLength + 1).join('x'));
       let passKey = `${passKeyPrefix}/validkeyname`;

       // then
       expect(labelKeyPrefixLengthType.isValid(passKey)).toBeTruthy();
     });
});
