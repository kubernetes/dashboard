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

describe('DeployFromFile controller', () => {
  /** @type {!DeployFromFileController} */
  let ctrl;
  /** @type {!angular.$resource} */
  let mockResource;
  /** @type {!angular.$resource} */
  let resource;
  /** @type {!angular.FormController} */
  let form;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$q} **/
  let q;
  /** @type {!angular.$scope} **/
  let scope;
  /** @type {!DeployService} */
  let service;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(
        ($componentController, $httpBackend, $resource, $mdDialog, _kdCsrfTokenService_, kdDeployService, $q,
         $rootScope) => {
          service = kdDeployService;
          mockResource = jasmine.createSpy('$resource');
          resource = $resource;
          mdDialog = $mdDialog;
          q = $q;
          scope = $rootScope.$new();
          form = {
            $valid: true,
          };
          ctrl = $componentController(
              'kdDeployFromFile', {
                $resource: mockResource,
                $mdDialog: mdDialog,
                kdCsrfTokenService: _kdCsrfTokenService_,
              },
              {form: form});
          httpBackend = $httpBackend;
          httpBackend.expectGET('api/v1/csrftoken/appdeploymentfromfile')
              .respond(200, '{"token": "x"}');
        });
  });

  it('should deploy with file name and content', () => {
    // given
    let resourceObject = {
      save: jasmine.createSpy('save'),
    };
    ctrl.file.name = 'test.yaml';
    ctrl.file.content = 'test_content';
    mockResource.and.callFake(() => resourceObject);
    resourceObject.save.and.callFake((spec) => {
      // then
      expect(spec.name).toBe('test.yaml');
      expect(spec.content).toBe('test_content');
    });
    // when
    ctrl.deploy();
    httpBackend.flush(1);

    // then
    expect(resourceObject.save).toHaveBeenCalled();
  });

  it('should cancel', () => {
    spyOn(ctrl.kdHistoryService_, 'back');
    ctrl.cancel();
    expect(ctrl.kdHistoryService_.back).toHaveBeenCalled();
  });
});
