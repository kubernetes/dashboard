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

import DeployLabelController from 'deploy/deploylabel_controller';
import DeployLabel from 'deploy/deploylabel';

describe('DeployLabel controller', () => {
  let ctrl;
  let labelForm;

  beforeEach(() => {
    ctrl = new DeployLabelController();

    angular.mock.inject(($rootScope, $compile) => {
      let scope = $rootScope.$new();
      let template = angular.element(
          '<ng-form name="labelForm"><input name="key"' +
          ' ng-model="label"></ng-form>');

      $compile(template)(scope);
      labelForm = scope.labelForm;
    });
  });

  it('should return true when label is editable and not last on the list', () => {
    // given
    ctrl.label = new DeployLabel('key', 'value', true);
    ctrl.labels = [
      ctrl.label,
      new DeployLabel('key2', 'value2', true),
    ];

    // when
    let result = ctrl.isRemovable();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false when label is not editable and not last on the list', () => {
    // given
    ctrl.label = new DeployLabel('key', 'value', false);
    ctrl.labels = [
      ctrl.label,
      new DeployLabel('key2', 'value2', true),
    ];

    // when
    let result = ctrl.isRemovable();

    // then
    expect(result).toBeFalsy();
  });

  it('should return false when label is editable and last on the list', () => {
    // given
    ctrl.label = new DeployLabel('key', 'value', false);
    ctrl.labels = [
      new DeployLabel('key2', 'value2', true),
      ctrl.label,
    ];

    // when
    let result = ctrl.isRemovable();

    // then
    expect(result).toBeFalsy();
  });

  it('should delete label from list when found', () => {
    // given
    ctrl.label = new DeployLabel('key');
    ctrl.labels = [
      new DeployLabel('key2'),
      ctrl.label,
    ];

    // when
    ctrl.deleteLabel();

    // then
    expect(ctrl.labels.length).toEqual(1);
  });

  it('should do nothing when label not found', () => {
    // given
    ctrl.label = new DeployLabel('key');
    ctrl.labels = [
      new DeployLabel('key2'),
      new DeployLabel('key3'),
    ];

    // when
    ctrl.deleteLabel();

    // then
    expect(ctrl.labels.length).toEqual(2);
  });

  it('should add new label to the list when last is filled', () => {
    // given
    ctrl.label = new DeployLabel();
    ctrl.labels = [
      new DeployLabel('key', 'value'),
    ];

    // when
    ctrl.check();

    // then
    expect(ctrl.labels.length).toEqual(2);
  });

  it('should set validity to false when duplicated key is found', () => {
    // given
    ctrl.label = new DeployLabel('key');
    ctrl.labels = [
      ctrl.label,
      new DeployLabel('key'),
    ];

    // when
    ctrl.check(labelForm);

    // then
    expect(labelForm.key.$valid).toBeFalsy();
  });

  it('should set validity to true when duplicated key is not found', () => {
    // given
    ctrl.label = new DeployLabel('key');
    ctrl.labels = [
      ctrl.label,
      new DeployLabel('key1'),
    ];

    // when
    ctrl.check(labelForm);

    // then
    expect(labelForm.key.$valid).toBeTruthy();
  });

  /**
   * RegExp for prefix checks that whatever is before the slash (if anything) matches:
   * beginning and ending with a lowercase letter or number, with single character
   * '.' and/or single/multiple character '-' between words, not touching each other,
   * seperated from key name with a single slash (no slashes in the prefix are
   * currently permitted by the back end validation)
   */
  it('should set validity to false when key prefix does not conform to RegExp ' +
         '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)* ',
     () => {
       // given
       let failPrefixes = [
         '.dotatbegining/key',
         'dotatend./key',
         'dot-next-.to-dash/key',
         '-dash-at-beginning/key',
         'dash-at-end-/key',
         'CapitalLetter/key',
         'more/than/one/slash/key',
         'illegal_characters/key',
         'space in prefix/key',
       ];
       failPrefixes.forEach((failPrefix) => {
         ctrl.label = new DeployLabel(failPrefix);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeFalsy();
       });
     });

  it('should set validity to true when key prefix conforms to RegExp ' +
         '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)* ',
     () => {
       // given
       let passPrefixes = [
         'validdns.com/key',
         'validdns.co.uk/key',
         'valid-dns.com/key',
         'validdns/key',
         '01234/key',
       ];
       passPrefixes.forEach((passPrefix) => {
         ctrl.label = new DeployLabel(passPrefix);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeTruthy();
       });
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
         'illegal$character',
         'illegal@character',
       ];

       failKeyNames.forEach((failKeyName) => {
         ctrl.label = new DeployLabel(failKeyName);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeFalsy();
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
         ctrl.label = new DeployLabel(passKeyName);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeTruthy();
       });
     });

  /**
   * key prefix (before slash) should be no longer than 253 characters.
   */
  it('should set validity to false when key prefix (before slash) exceeds 253 characters ', () => {
    // given
    // failKey contains a 254 character prefix before slash
    let stringLength = 254;
    let failPrefix = new Array(stringLength + 1).join('x');
    let failKey = `${failPrefix}/validkeyname`;

    ctrl.label = new DeployLabel(failKey);
    ctrl.labels = [
      ctrl.label,
    ];

    // when
    ctrl.check(labelForm);

    // then
    expect(labelForm.key.$valid).toBeFalsy();
  });

  it('should set validity to true when key prefix (before slash) is not longer than 253 characters ',
     () => {
       // given
       // passKey contains a 253 character prefix before slash
       let stringLength = 253;
       let passPrefix = (new Array(stringLength + 1).join('x'));
       let passKey = `${passPrefix}/validkeyname`;

       ctrl.label = new DeployLabel(passKey);
       ctrl.labels = [
         ctrl.label,
       ];

       // when
       ctrl.check(labelForm);

       // then
       expect(labelForm.key.$valid).toBeTruthy();
     });

  /**
   * key name (after slash or whole string if no slash in string) should be no longer than 253
   * characters.
   */
  it('should set validity to false when key name ' +
         '(after slash, or whole string if no slash present) ' +
         'exceeds 63 characters ',
     () => {
       // given
       let stringLength = 64;
       let failNameNoPrefix = (new Array(stringLength + 1).join('x'));
       let failNameWithPrefix = `validprefix.com/${failNameNoPrefix}`;

       let failKeyNames = [
         failNameNoPrefix,
         failNameWithPrefix,
       ];

       failKeyNames.forEach((failKeyName) => {
         ctrl.label = new DeployLabel(failKeyName);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeFalsy();
       });
     });

  /**
   * key name (after slash or whole string if no slash in string) should be no longer than 63
   * characters.
   */
  it('should set validity to true when key name ' +
         '(after slash, or whole string if no slash present) ' +
         'does not exceed 63 characters ',
     () => {
       // given
       let stringLength = 63;
       let passNameNoPrefix = (new Array(stringLength + 1).join('x'));
       let passNameWithPrefix = `validprefix.com/${passNameNoPrefix}`;

       let passKeyNames = [
         passNameNoPrefix,
         passNameWithPrefix,
       ];

       passKeyNames.forEach((passKeyName) => {
         ctrl.label = new DeployLabel(passKeyName);
         ctrl.labels = [
           ctrl.label,
         ];

         // when
         ctrl.check(labelForm);

         // then
         expect(labelForm.key.$valid).toBeTruthy();
       });
     });
});
