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

import DeployLabelController from 'deploy/deployfromsettings/deploylabel/component';
import DeployLabel from 'deploy/deployfromsettings/deploylabel/deploylabel';
import deployModule from 'deploy/module';

describe('DeployLabel controller', () => {
  let ctrl;
  let labelForm;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($rootScope, $compile, $controller) => {
      let scope = $rootScope.$new();
      let template = angular.element(
          '<ng-form name="labelForm"><input name="key"' +
          ' ng-model="label"></ng-form>');

      $compile(template)(scope);
      ctrl = $controller(DeployLabelController);
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
});
