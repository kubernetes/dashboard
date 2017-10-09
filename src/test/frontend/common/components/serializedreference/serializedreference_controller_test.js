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

import componentsModule from 'common/components/module';
import {stateName as jobState} from 'job/detail/state';

describe('SerializedReference controller', () => {
  /**
   * @type {!LabelsController}
   */
  let ctrl;

  /** {!angular.Scope} */
  let scope;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    angular.mock.inject(($componentController, $rootScope) => {
      scope = $rootScope;
      ctrl = $componentController('kdSerializedReference', {$scope: $rootScope});
    });
    spyOn(ctrl.state_, 'href');
  });

  it('should give the correct values for derived properties on a valid reference', () => {
    // given
    ctrl.reference = JSON.stringify({
      kind: 'SerializedReference',
      reference: {
        kind: 'Job',
        name: 'testJob',
        namespace: 'testing',
      },
    });

    ctrl.state_.href.and.callFake((stateName, stateParams) => {
      expect(stateName).toBe(jobState);
      expect(stateParams.objectNamespace).toBe('testing');
      expect(stateParams.objectName).toBe('testJob');
    });

    // when
    scope.$digest();

    // then
    expect(ctrl.valid).toBe(true);
    expect(ctrl.kind).toBe('Job');
    expect(ctrl.name).toBe('testJob');
    expect(ctrl.state_.href).toHaveBeenCalled();
  });

  it('should set the state to invalid on invalid JSON', () => {
    // given
    ctrl.reference = '{invalid-json';

    // when
    scope.$digest();

    // then
    expect(ctrl.valid).toBe(false);
    expect(ctrl.state_.href).not.toHaveBeenCalled();
  });

  it('should set the state to invalid on a non SerializedReference object', () => {
    // given
    ctrl.reference = JSON.stringify({kind: 'NotSerializedReference', data: {}});

    // when
    scope.$digest();

    // then
    expect(ctrl.valid).toBe(false);
    expect(ctrl.state_.href).not.toHaveBeenCalled();
  });

  it('should call recalculateDerivedProperties when the reference changes', () => {
    scope.$digest();
    spyOn(ctrl, 'recalculateDerivedProperties');
    ctrl.reference = 'anything else';

    scope.$digest();

    expect(ctrl.recalculateDerivedProperties).toHaveBeenCalled();
  });

});
