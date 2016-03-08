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

import {LabelKeyPrefixPatternType} from 'common/validators/types/labelkeyprefixpatterntype';

describe('Label Key Prefix Pattern type', () => {
  /** @type {!LabelKeyPrefixPatternType} */
  let labelKeyPrefixPatternType;

  beforeEach(() => {
    angular.mock.inject(() => { labelKeyPrefixPatternType = new LabelKeyPrefixPatternType(); });
  });

  /**
   * RegExp for prefix checks that whatever is before the slash (if anything) matches:
   * beginning and ending with a lowercase letter or number, with single character
   * '.' and/or single/multiple character '-' between words, not touching each other,
   * separated from key name with a single slash (no slashes in the prefix are
   * currently permitted by the back end validation)
   *
   * [a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)
   */
  it('should set validity to false when key prefix does not conform to RegExp', () => {
    // given
    let failPrefixes = [
      '.dotatbegining/key',
      'dotatend./key',
      'dot-next-.to-dash/key',
      '-dash-at-beginning/key',
      'dash-at-end-/key',
      'CapitalLetter/key',
      'illegal_characters/key',
      'space in prefix/key',
    ];
    failPrefixes.forEach((failPrefix) => {
      // then
      expect(labelKeyPrefixPatternType.isValid(failPrefix)).toBeFalsy();
    });
  });

  it('should set validity to true when key prefix conforms to RegExp', () => {
    // given
    let passPrefixes = [
      'validdns.com/key',
      'validdns.co.uk/key',
      'valid-dns.com/key',
      'validdns/key',
      '01234/key',
    ];
    passPrefixes.forEach((passPrefix) => {
      // then
      expect(labelKeyPrefixPatternType.isValid(passPrefix)).toBeTruthy();
    });
  });
});
