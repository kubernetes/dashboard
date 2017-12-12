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

import module from 'deploy/module';

describe('Deploy service', () => {

  /** @type {!DeployService} */
  let service;

  /** @type {!angular.$httpBackend} */
  let httpBackend;

  /** @type {!angular.$resource} */
  let angularResource;

  /** @type {!angular.$resource} */
  let mockResource;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject((kdDeployService, $httpBackend, $resource, $mdDialog) => {
      service = kdDeployService;
      service.mdDialog_ = $mdDialog;
      httpBackend = $httpBackend;
      angularResource = $resource;
      mockResource = jasmine.createSpy('$resource');
    });
  });

  it('should enable deploy when there is no deploy in progress', () => {
    expect(service.isDeployDisabled()).toBe(false);
  });

  it('should correctly detect validation errors', () => {
    expect(service.hasValidationError_('try to set validate=false to retry')).toBe(true);
    expect(service.hasValidationError_('everything works fine')).toBe(false);
    expect(service.hasValidationError_('')).toBe(false);
  });

  it('should show deploy anyway dialog', () => {
    spyOn(service.mdDialog_, 'show');
    service.showDeployAnywayDialog('error message');
    expect(service.mdDialog_.show).toHaveBeenCalled();
  });

  it('should redirect and not open error dialog after successful deploy from settings', () => {
    spyOn(service.errorDialog_, 'open');
    spyOn(service.state_, 'go');

    mockResource.and.callFake(angularResource);
    let response = {
      containerImage: 'nginx',
      name: 'nginx',
      description: 'test app',
      namespace: 'default',
      error: '',
    };

    httpBackend.expectGET('api/v1/csrftoken/appdeployment').respond(200, '{"token": "x"}');
    httpBackend.expectPOST('api/v1/appdeployment').respond(201, response);
    service.deploy(response);
    httpBackend.flush();

    expect(service.errorDialog_.open).not.toHaveBeenCalled();
    expect(service.state_.go).toHaveBeenCalled();
  });

  it('should redirect and not open error dialog after successful deploy from file', () => {
    spyOn(service.errorDialog_, 'open');
    spyOn(service.state_, 'go');

    mockResource.and.callFake(angularResource);
    let response = {
      name: 'foo-name',
      content: 'sample-yaml-content',
      error: '',
    };

    httpBackend.expectGET('api/v1/csrftoken/appdeploymentfromfile').respond(200, '{"token": "x"}');
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(201, response);
    service.deployContent('sample-yaml-content');
    httpBackend.flush();

    expect(service.errorDialog_.open).not.toHaveBeenCalled();
    expect(service.state_.go).toHaveBeenCalled();
  });

  it('should open error dialog and redirect the page when service already exists during deploy from file',
     () => {
       spyOn(service.errorDialog_, 'open');
       spyOn(service.state_, 'go');

       mockResource.and.callFake(angularResource);
       let response = {
         name: 'foo-name',
         content: 'sample-yaml-content',
         error: 'service already exists',
       };

       httpBackend.expectGET('api/v1/csrftoken/appdeploymentfromfile')
           .respond(200, '{"token": "x"}');
       httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(201, response);

       expect(service.isDeployDisabled()).toBe(false);
       service.deployContent('sample-yaml-content');
       httpBackend.flush(1);
       expect(service.isDeployDisabled()).toBe(true);
       httpBackend.flush();
       expect(service.isDeployDisabled()).toBe(false);

       expect(service.errorDialog_.open).toHaveBeenCalled();
       expect(service.state_.go).toHaveBeenCalled();
     });

  it('should not redirect the page and but open error dialog', (doneFn) => {
    spyOn(service.errorDialog_, 'open');
    spyOn(service.state_, 'go');

    mockResource.and.callFake(angularResource);
    httpBackend.expectGET('api/v1/csrftoken/appdeploymentfromfile').respond(200, '{"token": "x"}');
    httpBackend.expectPOST('api/v1/appdeploymentfromfile').respond(500, 'deployment failed');
    let promise = service.deployContent('sample-yaml-content');
    promise.catch(doneFn);
    httpBackend.flush();

    expect(service.errorDialog_.open).toHaveBeenCalled();
    expect(service.state_.go).not.toHaveBeenCalled();
  });

  it('should open deploy anyway dialog when validation error occurs during deploy from file',
     (doneFn) => {
       spyOn(service, 'handleDeployAnywayDialog_');
       mockResource.and.callFake(angularResource);

       httpBackend.expectGET('api/v1/csrftoken/appdeploymentfromfile')
           .respond(200, '{"token": "x"}');
       httpBackend.expectPOST('api/v1/appdeploymentfromfile')
           .respond(500, `error: use --validate=false`);
       let promise = service.deployContent('sample-yaml-content');
       promise.catch(doneFn);
       httpBackend.flush();

       // then
       expect(service.handleDeployAnywayDialog_).toHaveBeenCalled();
     });
});
