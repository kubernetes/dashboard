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

import {LabelKeyNamePatternType} from 'common/validators/types/labelkeynamepatterntype';

describe('Label Key Name Pattern type', () => {
  /** @type {!LabelKeyNamePatternType} */
  let labelKeyNamePatternType;

  beforeEach(() => {
    angular.mock.inject(() => { labelKeyNamePatternType = new LabelKeyNamePatternType(); });
  });

  /**
   * RegExp for key name checks that whatever is after the slash (if there is one)
   * or the whole word (if there is no slash) matches:
   * beginning and ending with upper or lowercase alphanumeric characters
   * separated by '.', '_', '-' only.
   */
  it('should set validity to false when key name (after slash) does not conform to RegExp ' +
         '([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9] ',
     () => {
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
         expect(labelKeyNamePatternType.isValid(failKeyName)).toBeFalsy();
       });
     });

  it('should set validity to true when key name (after slash) conforms to RegExp ' +
         '([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9] ',
     () => {
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
         expect(labelKeyNamePatternType.isValid(passKeyName)).toBeTruthy();
       });
     });
});
