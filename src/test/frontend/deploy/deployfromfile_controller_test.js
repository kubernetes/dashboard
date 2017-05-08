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

import DeployFromFileController from 'deploy/deployfromfile_controller';
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

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(
        ($controller, $httpBackend, $resource, $mdDialog, _kdCsrfTokenService_, $q, $rootScope) => {
          mockResource = jasmine.createSpy('$resource');
          resource = $resource;
          mdDialog = $mdDialog;
          q = $q;
          scope = $rootScope.$new();
          form = {
            $valid: true,
          };
          ctrl = $controller(
              DeployFromFileController, {
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

  it('should open error dialog and redirect the page', () => {
    spyOn(ctrl.errorDialog_, 'open');
    spyOn(ctrl.kdHistoryService_, 'back');
    let response = {
      name: 'foo-name',
      content: 'foo-content',
      error: 'service already exists',
    };
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(201, response);
    mockResource.and.callFake(resource);
    expect(ctrl.isDeployDisabled()).toBe(false);
    ctrl.deploy();
    httpBackend.flush(1);
    expect(ctrl.isDeployDisabled()).toBe(true);
    httpBackend.flush();
    expect(ctrl.isDeployDisabled()).toBe(false);

    // then
    expect(ctrl.errorDialog_.open).toHaveBeenCalled();
    expect(ctrl.kdHistoryService_.back).toHaveBeenCalled();
  });

  it('should redirect the page and not open error dialog', () => {
    spyOn(ctrl.errorDialog_, 'open');
    spyOn(ctrl.kdHistoryService_, 'back');
    mockResource.and.callFake(resource);
    let response = {
      name: 'foo-name',
      content: 'foo-content',
      error: '',
    };
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(201, response);
    // when
    ctrl.deploy();
    httpBackend.flush();

    // then
    expect(ctrl.errorDialog_.open).not.toHaveBeenCalled();
    expect(ctrl.kdHistoryService_.back).toHaveBeenCalled();
  });

  it('should not redirect the page and but open error dialog', (doneFn) => {
    spyOn(ctrl.errorDialog_, 'open');
    spyOn(ctrl.kdHistoryService_, 'back');
    mockResource.and.callFake(resource);
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(500, 'Deployment failed');
    // when
    let promise = ctrl.deploy();
    promise.catch(doneFn);
    httpBackend.flush();

    // then
    expect(ctrl.errorDialog_.open).toHaveBeenCalled();
    expect(ctrl.kdHistoryService_.back).not.toHaveBeenCalled();
  });

  it('should cancel', () => {
    spyOn(ctrl.kdHistoryService_, 'back');
    ctrl.cancel();
    expect(ctrl.kdHistoryService_.back).toHaveBeenCalled();
  });

  it('should open deploy anyway dialog when validation error occurs', (doneFn) => {
    spyOn(ctrl, 'handleDeployAnywayDialog_');
    mockResource.and.callFake(resource);
    httpBackend.expectPOST('api/v1/appdeploymentfromfile')
        .respond(500, `error: use --validate=false`);

    // when
    let promise = ctrl.deploy();
    promise.catch(doneFn);
    httpBackend.flush();

    // then
    expect(ctrl.handleDeployAnywayDialog_).toHaveBeenCalled();
  });

  // TODO(maciaszczykm): Reenable this after fixing random flakes.
  xit('should redeploy on deploy anyway 123', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    spyOn(mdDialog, 'confirm').and.callThrough();
    spyOn(ctrl, 'deploy').and.callThrough();
    mockResource.and.callFake(resource);
    httpBackend.expectPOST('api/v1/appdeploymentfromfile')
        .respond(500, `error: use --validate=false`);

    // first deploy
    let promise = ctrl.deploy();
    promise.catch(doneFn);
    httpBackend.flush();

    // dialog shown and redeploy accepted
    expect(mdDialog.show).toHaveBeenCalled();
    expect(mdDialog.confirm).toHaveBeenCalled();

    // redeploying
    deferred.resolve();
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(200, 'ok');
    scope.$digest();

    expect(ctrl.deploy).toHaveBeenCalledTimes(2);
  });

  it('should do nothing on cancel deploy anyway', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    spyOn(mdDialog, 'confirm').and.callThrough();
    spyOn(ctrl, 'deploy').and.callThrough();
    mockResource.and.callFake(resource);
    httpBackend.expectPOST('api/v1/appdeploymentfromfile')
        .respond(500, `error: use --validate=false`);

    // first deploy
    let promise = ctrl.deploy();
    promise.catch(doneFn);
    httpBackend.flush();

    // dialog shown and redeploy cancelled
    expect(mdDialog.show).toHaveBeenCalled();
    expect(mdDialog.confirm).toHaveBeenCalled();
    deferred.reject();
    scope.$digest();

    expect(ctrl.deploy).toHaveBeenCalledTimes(1);
  });
});
