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

import {shouldRemoveWarning, shouldSetWarning} from 'common/components/warnthreshold/warnthreshold';
import {removeWarning, setWarning} from 'common/components/warnthreshold/warnthreshold';

describe('Warn threshold', () => {
  /**
   * Returns simple mock object for input field NgModelController
   *
   * @param {number} viewValue
   * @return {{$viewValue: number, kdWarnThreshold: boolean}}
   */
  function getInputControllerMock(viewValue) {
    return {
      $viewValue: viewValue,
    };
  }

  /**
   * Returns simple mock object for directive attributes
   *
   * @param {number} thresholdValue
   * @return {{kdWarnThreshold: number}}
   */
  function getAttributesMock(thresholdValue) {
    return {
      'kdWarnThreshold': thresholdValue,
    };
  }

  /**
   * Return simple mock object for scope
   *
   * @return {{kdWarnBind: boolean}}
   */
  function getScopeMock() {
    return {
      'kdWarnThresholdBind': false,
    };
  }

  /**
   * Creates simple element that can be used in tests as a mock.
   *
   * @return {!angular.JQLite}
   */
  function getMdInputContainerElement() {
    return angular.element(`<md-input-container></md-input-container>`);
  }

  it('should set warning when threshold has been breached', () => {
    // given
    let inputCtrl = getInputControllerMock(105);
    let attrs = getAttributesMock(100);
    let inputContainer = getMdInputContainerElement();
    let scopeMock = getScopeMock();

    // when
    let result = shouldSetWarning(inputCtrl, attrs);
    setWarning(inputContainer, scopeMock);

    // then
    expect(result).toBeTruthy();
    expect(inputContainer[0].classList).toContain('kd-warning');
    expect(scopeMock.kdWarnThresholdBind).toBeTruthy();
  });

  it('should remove warning when threshold has not been breached', () => {
    // given
    let inputCtrl = getInputControllerMock(50);
    let attrs = getAttributesMock(100);
    let inputContainer = getMdInputContainerElement();
    let scopeMock = getScopeMock();

    // when
    setWarning(inputContainer, scopeMock);
    let result = shouldRemoveWarning(inputCtrl, attrs, scopeMock);
    removeWarning(inputContainer, scopeMock);

    // then
    expect(result).toBeTruthy();
    expect(inputContainer[0].classList).not.toContain('kd-warning');
    expect(scopeMock.kdWarnThresholdBind).toBeFalsy();
  });
});
