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
import DeployLabel from 'deploy/deploylabel';
import deployModule from 'deploy/module';
import {uniqueNameValidationKey} from 'deploy/uniquename_directive';

describe('DeployFromSettings controller', () => {
  /** @type {!DeployFromSettingController} */
  let ctrl;
  /** @type {!angular.$resource} */
  let mockResource;
  /** @type {!angular.FormController} */
  let form;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!angular.$resource} */
  let angularResource;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller, $httpBackend, $resource) => {
      httpBackend = $httpBackend;
      httpBackend.expectGET('api/v1/csrftoken/appdeployment').respond(200, '{"token": "x"}');
      angularResource = $resource;
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
          DeployFromSettingController,
          {$resource: mockResource, namespaces: {namespaces: []}, protocols: {protocols: []}},
          {form: form});
      ctrl.portMappings = [];
      ctrl.variables = [];
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

  it('should select initial namespace', angular.mock.inject(($controller) => {
    ctrl = $controller(DeployFromSettingController, {
      namespaces: {namespaces: [{objectMeta: {name: 'foo'}}, {objectMeta: {name: 'bar'}}]},
      protocols: {protocols: []},
      $stateParams: {},
    });

    expect(ctrl.namespace).toBe('foo');

    ctrl = $controller(DeployFromSettingController, {
      namespaces: {namespaces: [{objectMeta: {name: 'foo'}}, {objectMeta: {name: 'bar'}}]},
      protocols: {protocols: []},
      $stateParams: {namespace: 'bar'},
    });

    expect(ctrl.namespace).toBe('bar');
  }));

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

  it('should return part of the string after `:` delimiter', () => {
    // given
    ctrl.containerImage = 'private.registry:5000/test:1';

    // when
    let result = ctrl.getContainerImageVersion_();

    // then
    expect(result).toEqual('1');
  });

  it('should return empty string when containerImage is not empty and does not containe `:`' +
         ' delimiter after `/` delimiter',
     () => {
       // given
       ctrl.containerImage = 'private.registry:5000/test';

       // when
       let result = ctrl.getContainerImageVersion_();

       // then
       expect(result).toEqual('');
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

  it('should deploy empty description, container commands and image pull secret as nulls', () => {
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
      expect(spec.imagePullSecret).toBeNull();
    });
    ctrl.labels = [
      new DeployLabel('key1', 'val1'),
    ];

    // when
    form.$valid = true;
    ctrl.deploy();
    httpBackend.flush(1);

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
      expect(spec.imagePullSecret).toBe('mysecret');
    });
    ctrl.labels = [
      new DeployLabel('key1', 'val1'),
    ];
    ctrl.containerCommand = 'command';
    ctrl.containerCommandArgs = 'commandArgs';
    ctrl.description = 'desc';
    ctrl.imagePullSecret = 'mysecret';

    // when
    form.$valid = true;
    ctrl.deploy();
    httpBackend.flush(1);

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
    form.$valid = true;
    ctrl.deploy();
    httpBackend.flush(1);

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
    form.$valid = true;
    ctrl.deploy();
    httpBackend.flush(1);

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

  it('should cancel', angular.mock.inject(($state) => {
    spyOn($state, 'go');

    // when
    ctrl.cancel();

    // then
    expect($state.go).toHaveBeenCalled();
  }));

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

    it('get secrets should update the secrets list', () => {
      ctrl.resource_ = angularResource;
      let response = {
        'secrets': [
          {'objectMeta': {'name': 'secret1'}},
          {'objectMeta': {'name': 'secret2'}},
          {'objectMeta': {'name': 'secret3'}},
        ],
      };
      httpBackend.expectGET('api/v1/secret/default').respond(200, response);
      // when
      ctrl.getSecrets('default');
      httpBackend.flush();
      // expect
      expect(ctrl.secrets).toEqual(['secret1', 'secret2', 'secret3']);
    });

    it('successful image pull secret creation should update ctrl.imagePullSecret', () => {
      // given
      let response = 'newsecret';
      // mdDialog mock
      let mdDialogMock = {
        show: (arg) => {
          arg;
          return {
            then: (success, fail) => {
              // ignore fail
              fail;
              // execute success
              success(response);
            },
          };
        },
      };
      ctrl.mdDialog_ = mdDialogMock;
      // when
      ctrl.handleCreateSecretDialog({});
      // then
      expect(ctrl.imagePullSecret).toEqual(response);
    });

    it('should filter out empty variables', () => {
      // given
      ctrl.variables = [{name: 'foo', value: 'bar'}, {}, {name: ''}];
      let resourceObject = {
        save: jasmine.createSpy('save'),
      };
      mockResource.and.returnValue(resourceObject);
      resourceObject.save.and.callFake(function(spec) {
        // then
        expect(spec.variables).toEqual([{name: 'foo', value: 'bar'}]);
      });
      ctrl.cpuRequirement = 77;
      ctrl.memoryRequirement = 88;

      // when
      form.$valid = true;
      expect(ctrl.isDeployDisabled()).toBe(false);
      ctrl.deploy();
      httpBackend.flush(1);
      expect(ctrl.isDeployDisabled()).toBe(true);

      // then
      expect(resourceObject.save).toHaveBeenCalled();
    });

    it('unsuccessful image pull secret creation should reset ctrl.imagePullSecret', () => {
      // given
      // mdDialog mock
      let mdDialogMock = {
        show: (arg) => {
          arg;
          return {
            then: (success, fail) => {
              // execute fail
              fail();
              // ignore success
              success;
            },
          };
        },
      };
      ctrl.mdDialog_ = mdDialogMock;
      // when
      ctrl.handleCreateSecretDialog({});
      // then
      expect(ctrl.imagePullSecret).toEqual('');
    });
  });

  /**
   * The value entered for ‘App Name” is used implicitly as the name for several resources (pod, rc,
   * svc, label). Therefore, the app-name validation pattern is based on the servicePattern, but
   * must conform with all validation patterns of all the created resources.
   * Currently, the ui pattern that conforms with all patterns starts with a lowercase letter,
   * is lowercase alpha-numeric with dashes between.
   */
  it('should allow strings that conform to the patterns of all created resources', () => {
    // given the pattern used by the App Name field in the UI
    let namePattern = ctrl.namePattern;
    // given the patterns of all the names that are implicitly created
    let allPatterns = {
      servicePattern: '[a-z]([-a-z0-9]*[a-z0-9])?',
      labelPattern: '(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?',
      rcPattern: '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*',
      appNamePattern: namePattern,
    };

    // then
    Object.keys(allPatterns).forEach((pattern) => {
      expect('mylowercasename'.match(allPatterns[pattern])).toBeDefined();
      expect('my-name-with-dashes-between'.match(allPatterns[pattern])).toBeDefined();
      expect('my-n4m3-with-numb3r5'.match(allPatterns[pattern])).toBeDefined();
    });
  });

  /**
   * The value entered for 'App Name' is used implicitly as the name for several resources (pod, rc,
   * svc, label).
   * Remark: The app-name pattern excludes some RC names and label values, which could be
   * created manually. This is a restriction of the current design.
   */
  it('should reject names that fail to conform to appNamePattern', () => {

    // given
    let appNamePattern = ctrl.namePattern;

    // then the following valid service names will be rejected
    expect('validservice.com'.match(appNamePattern)).toBeNull();
    expect('validservice/path'.match(appNamePattern)).toBeNull();

    // then the following valid label names will be rejected
    expect('valid_label'.match(appNamePattern)).toBeNull();
    expect('ValidLabel'.match(appNamePattern)).toBeNull();
    expect('validLabel'.match(appNamePattern)).toBeNull();

    // then these input values will be rejected
    expect('@myname-with-illegal-char-prefix'.match(appNamePattern)).toBeNull();
    expect('myname-with-illegal-char-suffix#'.match(appNamePattern)).toBeNull();
    expect('myname-with-illegal_char-in-middle'.match(appNamePattern)).toBeNull();
    expect('-myname-with-hyphen-prefix'.match(appNamePattern)).toBeNull();
    expect('myname-with-hyphen-suffix-'.match(appNamePattern)).toBeNull();
    expect('Myname-With-Capital-Letters'.match(appNamePattern)).toBeNull();
    expect('myname-with-german-umlaut-äö'.match(appNamePattern)).toBeNull();
    expect('my name with spaces'.match(appNamePattern)).toBeNull();
    expect('  '.match(appNamePattern)).toBeNull();
  });

  /**
   * The data from the App Name field of the deploy form is used implicitly for the creation of
   * Service Name, Label Name and RC name. Pod names are truncated by the api server and therefore
   * ignored.
   * Remark: The maximum characters number should match all three, thereby excluding
   * service names of more than 24 chars via this form, while it is possible to RC pod names
   * of 253 chars manually. This is a restriction of the current design.
   *
   * ctrl.maxNameLength = 24
   */
  it('should limit input that conforms to all created resources', () => {

    // service names are max. 24 chars
    expect(ctrl.maxNameLength <= 24);

    //  label are max. 63 chars. the 256 prefix cannot be entered
    expect(ctrl.maxNameLength <= 63);

    // RC name are max. 253 chars.
    expect(ctrl.maxNameLength <= 253);
  });
});
