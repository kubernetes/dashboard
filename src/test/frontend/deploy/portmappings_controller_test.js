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

import deployModule from 'deploy/deploy_module';
import PortMappingsController from 'deploy/portmappings_controller';

describe('PortMappingsController controller', () => {
  /** @type {!PortMappingsController} */
  let ctrl;
  let portMappingForm;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller, $rootScope, $compile) => {
      ctrl = $controller(PortMappingsController, undefined, {protocols: ['FOO', 'BAR']});
      let scope = $rootScope.$new();
      let template = angular.element(`<ng-form name="portMappingForm">
            <input name="port" ng-model="port">
            <input name="targetPort" ng-model="targetPort">
           </ng-form>`);

      $compile(template)(scope);
      portMappingForm = scope.portMappingForm;
    });
  });

  it('should initialize first value', () => {
    expect(ctrl.portMappings).toEqual([{port: null, targetPort: null, protocol: 'FOO'}]);
  });

  it('should add new mappings when needed', () => {
    expect(ctrl.portMappings.length).toBe(1);

    ctrl.checkPortMapping(undefined, 0);
    expect(ctrl.portMappings.length).toBe(1);

    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;

    ctrl.checkPortMapping(undefined, 0);
    expect(ctrl.portMappings.length).toBe(2);
  });

  it('should determine removability', () => {
    expect(ctrl.isRemovable(0)).toBe(false);
    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;
    ctrl.checkPortMapping(undefined, 0);
    expect(ctrl.isRemovable(0)).toBe(true);
  });

  it('should remove port mappings', () => {
    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;
    ctrl.checkPortMapping(undefined, 0);
    expect(ctrl.portMappings.length).toBe(2);
    ctrl.remove(0);
    expect(ctrl.portMappings.length).toBe(1);
    expect(ctrl.portMappings[0].port).toBeNull();
  });

  it('should validate port mapping', () => {
    let testData = [
      ['', '', true, true],
      ['', 80, false, true],
      [80, '', true, false],
      [80, 80, true, true],
    ];

    testData.forEach((testData) => {
      // given
      let [port, targetPort, portValidity, targetPortValidity] = testData;
      ctrl.portMappings[0].port = port;
      ctrl.portMappings[0].targetPort = targetPort;

      // when
      ctrl.checkPortMapping(portMappingForm, 0);

      // then
      expect(portMappingForm.port.$valid).toEqual(portValidity);
      expect(portMappingForm.targetPort.$valid).toEqual(targetPortValidity);
    });
  });
});
