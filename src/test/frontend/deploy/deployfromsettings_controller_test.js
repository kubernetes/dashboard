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

describe('DeployFromSettings controller', () => {
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(DeployFromSettingController, {}, {namespaces: []});
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
});
