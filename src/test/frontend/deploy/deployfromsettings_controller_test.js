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

describe('DeployFromSettings controller', () => {
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($log, $state, $resource, $q) => {
      ctrl = new DeployFromSettingController($log, $state, $resource, $q);
    });
  });

  it('should return empty string when containerImage is undefined', () => {
    ctrl.containerImage = undefined;
    expect(ctrl.getContainerImageVersion_()).toEqual('');
  });

  it('should return empty string when containerImage is empty', () => {
    ctrl.containerImage = '';
    expect(ctrl.getContainerImageVersion_()).toEqual('');
  });

  it('should return empty string when containerImage is not empty and does not contain `:`' +
         ' delimiter',
     () => {
       ctrl.containerImage = 'test';
       expect(ctrl.getContainerImageVersion_()).toEqual('');
     });

  it('should return part of the string after `:` delimiter', () => {
    ctrl.containerImage = 'test:1';
    expect(ctrl.getContainerImageVersion_()).toEqual('1');
  });

});
