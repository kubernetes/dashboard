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

import DeployFromSettingController from 'deploy/deployfromsettings_controller';
import deployModule from 'deploy/deploy_module';
import DeployLabel from 'deploy/deploylabel';
import {uniqueNameValidationKey} from 'deploy/uniquename_directive';

describe('DeployFromSettings controller', () => {
  /** @type {!DeployFromSettingController} */
  let ctrl;
  /** @type {!angular.$resource} */
  let mockResource;
  /** @type {!angular.FormController} */
  let form;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller) => {
      mockResource = jasmine.createSpy('$resource');
      form = {
        $submitted: false,
        name: {
          $touched: false,
          $invalid: false,
          $error: {
            [uniqueNameValidationKey]: false,
          },
        },
      };
      ctrl = $controller(
          DeployFromSettingController, {$resource: mockResource},
          {namespaces: [], form: form, protocols: []});
      ctrl.portMappings = [];
    });
  });

  it('should return empty string when containerImage is undefined', () => {
    // given
    ctrl.containerImage = undefined;

    // when
    let result = ctrl.getContainerImageVersion_();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is empty', () => {
    // given
    ctrl.containerImage = '';

    // when
    let result = ctrl.getContainerImageVersion_();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is not empty and does not contain `:`' +
         ' delimiter',
     () => {
       // given
       ctrl.containerImage = 'test';

       // when
       let result = ctrl.getContainerImageVersion_();

       // then
       expect(result).toEqual('');
     });

  it('should return part of the string after `:` delimiter', () => {
    // given
    ctrl.containerImage = 'test:1';

    // when
    let result = ctrl.getContainerImageVersion_();

    // then
    expect(result).toEqual('1');
  });

  it('should return empty array when labels array is empty', () => {
    // given
    let labels = [];

    // when
    let result = ctrl.toBackendApiLabels_(labels);

    // then
    expect(result).toEqual([]);
  });

  it('should return filtered backend api labels array without empty key/values', () => {
    // given
    let labels = [
      new DeployLabel('', 'val'),
      new DeployLabel('key1', 'val1'),
    ];

    // when
    let result = ctrl.toBackendApiLabels_(labels);

    // then
    let expected = [
      {
        key: 'key1',
        value: 'val1',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should deploy empty description and container commands as nulls', () => {
    // given
    let resourceObject = {
      save: jasmine.createSpy('save'),
    };
    mockResource.and.returnValue(resourceObject);
    resourceObject.save.and.callFake(function(spec) {
      // then
      expect(spec.containerCommand).toBeNull();
      expect(spec.containerCommandArgs).toBeNull();
      expect(spec.description).toBeNull();
    });
    ctrl.labels = [
      new DeployLabel('key1', 'val1'),
    ];

    // when
    ctrl.deploy();

    // then
    expect(resourceObject.save).toHaveBeenCalled();
  });

  it('should deploy non empty description and container commands', () => {
    // given
    let resourceObject = {
      save: jasmine.createSpy('save'),
    };
    mockResource.and.returnValue(resourceObject);
    resourceObject.save.and.callFake(function(spec) {
      // then
      expect(spec.containerCommand).toBe('command');
      expect(spec.containerCommandArgs).toBe('commandArgs');
      expect(spec.description).toBe('desc');
    });
    ctrl.labels = [
      new DeployLabel('key1', 'val1'),
    ];
    ctrl.containerCommand = 'command';
    ctrl.containerCommandArgs = 'commandArgs';
    ctrl.description = 'desc';

    // when
    ctrl.deploy();

    // then
    expect(resourceObject.save).toHaveBeenCalled();
  });

  it('should deploy with resource requirements', () => {
    // given
    let resourceObject = {
      save: jasmine.createSpy('save'),
    };
    mockResource.and.returnValue(resourceObject);
    resourceObject.save.and.callFake(function(spec) {
      // then
      expect(spec.cpuRequirement).toBe(77);
      expect(spec.memoryRequirement).toBe('88Mi');
    });
    ctrl.cpuRequirement = 77;
    ctrl.memoryRequirement = 88;

    // when
    ctrl.deploy();

    // then
    expect(resourceObject.save).toHaveBeenCalled();
  });

  it('should deploy with empty resource requirements', () => {
    // given
    let resourceObject = {
      save: jasmine.createSpy('save'),
    };
    mockResource.and.returnValue(resourceObject);
    resourceObject.save.and.callFake(function(spec) {
      // then
      expect(spec.cpuRequirement).toBe(null);
      expect(spec.memoryRequirement).toBe(null);
    });
    ctrl.cpuRequirement = null;
    ctrl.memoryRequirement = '';

    // when
    ctrl.deploy();

    // then
    expect(resourceObject.save).toHaveBeenCalled();
  });

  it('should hide more options by default', () => {
    // this is default behavior so no given/when
    // then
    expect(ctrl.isMoreOptionsEnabled()).toBe(false);
  });

  it('should show more options after switch', () => {
    // when
    ctrl.switchMoreOptions();

    // then
    expect(ctrl.isMoreOptionsEnabled()).toBe(true);
  });

  describe('isNameError', () => {
    it('should show all errors on submit', () => {
      expect(ctrl.isNameError()).toBe(false);

      form.name.$invalid = true;

      expect(ctrl.isNameError()).toBe(false);

      form.$submitted = true;

      expect(ctrl.isNameError()).toBe(true);
    });

    it('should show all errors when touched', () => {
      expect(ctrl.isNameError()).toBe(false);

      form.name.$invalid = true;

      expect(ctrl.isNameError()).toBe(false);

      form.name.$touched = true;

      expect(ctrl.isNameError()).toBe(true);
    });

    it('should always show name uniqueness errors', () => {
      expect(ctrl.isNameError()).toBe(false);

      form.name.$error[uniqueNameValidationKey] = true;

      expect(ctrl.isNameError()).toBe(true);

      form.$submitted = true;

      expect(ctrl.isNameError()).toBe(true);
    });
  });
});
