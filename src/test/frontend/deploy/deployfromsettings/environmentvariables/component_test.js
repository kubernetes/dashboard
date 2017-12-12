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

import deployModule from 'deploy/module';

describe('EnvironmentVariablesController', () => {
  /** @type {!EnvironmentVariablesController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdEnvironmentVariables');
      ctrl.$onInit();
    });
  });

  it('should initialize first value', () => {
    expect(ctrl.variables).toEqual([{name: '', value: ''}]);
  });

  it('should add new variables when needed', () => {
    expect(ctrl.variables.length).toBe(1);

    ctrl.addVariableIfNeeed();
    expect(ctrl.variables.length).toBe(1);

    ctrl.variables[0].name = 'gfgf';

    ctrl.addVariableIfNeeed();
    expect(ctrl.variables.length).toBe(2);
  });

  it('should determine removability', () => {
    expect(ctrl.isRemovable(0)).toBe(false);
    ctrl.variables[0].name = 'xxx';
    ctrl.addVariableIfNeeed();
    expect(ctrl.isRemovable(0)).toBe(true);
  });

  it('should remove variables', () => {
    ctrl.variables[0].name = 'xxx';
    ctrl.addVariableIfNeeed();
    expect(ctrl.variables.length).toBe(2);
    ctrl.remove(0);
    expect(ctrl.variables.length).toBe(1);
    expect(ctrl.variables[0].name).toBe('');
  });

  it('should validate name pattern', () => {
    let pattern = ctrl.namePattern;
    expect('valid'.match(pattern)).toBeDefined();
    expect('validFgdd'.match(pattern)).toBeDefined();

    expect('  validFgdd  '.match(pattern)).toBeNull();
    expect('validFgddą'.match(pattern)).toBeNull();
    expect(';[;]'.match(pattern)).toBeNull();
    expect('8790ghj'.match(pattern)).toBeNull();
    expect('khjk8907.'.match(pattern)).toBeNull();
    expect('validFgdd-foo'.match(pattern)).toBeNull();
    expect('validFgdd kjk'.match(pattern)).toBeNull();
  });
});
