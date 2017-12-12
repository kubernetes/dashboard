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

import DeployLabel from 'deploy/deployfromsettings/deploylabel/deploylabel';
import {uniqueNameValidationKey} from 'deploy/deployfromsettings/uniquename_directive';
import deployModule from 'deploy/module';

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

    angular.mock.inject(($componentController, $httpBackend, $resource) => {
      httpBackend = $httpBackend;
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
      ctrl = $componentController('kdDeployFromSettings', {$resource: mockResource}, {form: form});
      ctrl.portMappings = [];
      ctrl.variables = [];
    });
  });

  it('should disable input when form is invalid', () => {
    ctrl.form.$valid = false;
    expect(ctrl.isDeployDisabled()).toBeTruthy();
  });

  it('should select initial namespace', () => {
    ctrl.resource_ = angularResource;
    let response = {
      'namespaces': [
        {'objectMeta': {'name': 'namespace1'}},
        {'objectMeta': {'name': 'namespace2'}},
        {'objectMeta': {'name': 'namespace3'}},
      ],
    };
    httpBackend.expectGET('api/v1/namespace').respond(200, response);
    ctrl.$onInit();
    httpBackend.flush();
    expect(ctrl.namespace).toEqual('namespace1');
  });

  it('should select new namespace after it is created', () => {
    ctrl.namespaces = ['a', 'b', 'c'];
    ctrl.namespace = ctrl.namespaces[1];
    let newNamespace = 'd';

    ctrl.mdDialog_ = {
      show: (arg) => {
        arg;
        return {
          then: (success, fail) => {
            // ignore fail
            fail;
            // execute success
            success(newNamespace);
          },
        };
      },
    };

    ctrl.handleNamespaceDialog();
    expect(ctrl.namespace).toEqual(newNamespace);
  });

  it('should return empty array when labels array is empty', () => {
    let labels = [];
    let result = ctrl.toBackendApiLabels_(labels);
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

  it('should hide more options by default', () => {
    expect(ctrl.isMoreOptionsEnabled()).toBe(false);
  });

  it('should show more options after switch', () => {
    ctrl.switchMoreOptions();
    expect(ctrl.isMoreOptionsEnabled()).toBe(true);
  });

  it('should cancel', angular.mock.inject(($state) => {
    spyOn($state, 'go');
    ctrl.cancel();
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
      ctrl.getSecrets('default');
      httpBackend.flush();
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
      rcPattern: '[a-z0-9]([-a-z0-9]*[a-z0-9])?(.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*',
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
