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

import {removeWarning, setWarning, shouldRemoveWarning, shouldSetWarning} from './warnthreshold';
import {hasWarningAttr} from './warnthreshold';

/**
 * Description:
 *    Directive can be used to warn user that some number may be too big for given input field
 *    but not block the actual form submit.
 *
 * Params:
 *    - kdWarnThreshold - Max number that is allowed before input field will be marked with
 *      a warning.
 *    - kdWarnThresholdBind - boolean page scope variable that should be bound to directive. Warning
 *      state change will be populated to this variable.
 *
 * Usage:
 *    <md-input-container>
 *      <input type="number" name="maxInput" kd-warn-threshold="100"
 *             kd-warn-threshold-bind="showWarning">
 *      <span class="kd-warn-threshold" ng-show="showWarning">Warning message</span>
 *    </md-input-container>
 *
 * @return {!angular.Directive}
 */
export default function warnThresholdDirective() {
  return {
    restrict: 'A',
    require: ['^mdInputContainer', 'ngModel'],
    scope: {
      [hasWarningAttr]: '=',
    },
    /**
     * @param {!angular.Scope} scope
     * @param {!angular.JQLite} element
     * @param {!angular.Attributes} attrs
     * @param {!Array<!angular.NgModelController>} ctrl
     */
    link: (scope, element, attrs, ctrl) => {
      /** @type {!angular.JQLite} - MdInputContainer element */
      let inputContainer = element.parent();
      /** @type {!angular.NgModelController} */
      let inputCtrl = ctrl[1];

      inputCtrl.$viewChangeListeners.push(() => {
        if (shouldSetWarning(inputCtrl, attrs)) {
          setWarning(inputContainer, scope);
        }

        if (shouldRemoveWarning(inputCtrl, attrs, scope)) {
          removeWarning(inputContainer, scope);
        }
      });
    },
  };
}
