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

import * as serviceTypes from 'deploy/deployfromsettings/portmappings/component';
import {PortMappingsController} from 'deploy/deployfromsettings/portmappings/component';
import deployModule from 'deploy/module';

describe('PortMappingsController controller', () => {
  /** @type {!PortMappingsController} */
  let ctrl;
  let portMappingForm;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller, $rootScope, $compile) => {
      ctrl = $controller(
          PortMappingsController, undefined, {protocols: ['FOO', 'BAR'], portMappings: []});
      let scope = $rootScope.$new();
      let template = angular.element(`<ng-form name="portMappingForm">
            <input name="port" ng-model="port">
            <input name="targetPort" ng-model="targetPort">
           </ng-form>`);

      $compile(template)(scope);
      portMappingForm = scope.portMappingForm;
    });
  });

  it('should be initialized without port mapping line', () => {
    expect(ctrl.portMappings.length).toBe(0);
  });

  it('should add or remove port mappings, depending on service type', () => {

    // select internal service will add an empty port mapping
    ctrl.serviceType = serviceTypes.INT_SERVICE;
    ctrl.changeServiceType();
    expect(ctrl.portMappings.length).toBe(1);

    // select no service will remove all port mappings
    ctrl.serviceType = serviceTypes.NO_SERVICE;
    ctrl.changeServiceType();
    expect(ctrl.portMappings.length).toBe(0);
  });

  it('should add one additional port mapping when ports are filled', () => {

    // given is an empty port mapping line
    ctrl.serviceType = serviceTypes.INT_SERVICE;
    ctrl.changeServiceType();

    // when filling
    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;
    ctrl.checkPortMapping(undefined, 0);

    // then another line is added
    expect(ctrl.portMappings.length).toBe(2);
  });

  it('should not allow removal if no port mapping line would be left over', () => {

    // given is one (empty) port mapping line
    ctrl.serviceType = serviceTypes.INT_SERVICE;
    ctrl.changeServiceType();

    // then it cannot be removed
    expect(ctrl.isRemovable(0)).toBe(false);
  });

  it('should allow removal of one line if another is left over ', () => {

    // given is a filled and an empty port mapping line
    ctrl.serviceType = serviceTypes.INT_SERVICE;
    ctrl.changeServiceType();
    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;
    ctrl.checkPortMapping(undefined, 0);

    // then the first line is removable
    expect(ctrl.isRemovable(0)).toBe(true);
  });

  it('should remove port mappings', () => {

    // given is a filled and an empty port mapping line
    ctrl.serviceType = serviceTypes.INT_SERVICE;
    ctrl.changeServiceType();
    ctrl.portMappings[0].port = 80;
    ctrl.portMappings[0].targetPort = 8080;
    ctrl.checkPortMapping(undefined, 0);

    // when removing the first line
    ctrl.remove(0);

    // then the empty line is left over
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
      ctrl.serviceType = serviceTypes.INT_SERVICE;
      ctrl.changeServiceType();
      ctrl.portMappings[0].port = port;
      ctrl.portMappings[0].targetPort = targetPort;

      // when
      ctrl.checkPortMapping(portMappingForm, 0);

      // then
      expect(portMappingForm.port.$valid).toEqual(portValidity);
      expect(portMappingForm.targetPort.$valid).toEqual(targetPortValidity);
    });
  });

  it('should identify first index', () => {
    expect(ctrl.isFirst(0)).toEqual(true);
    expect(ctrl.isFirst(1)).toEqual(false);
  });
});
