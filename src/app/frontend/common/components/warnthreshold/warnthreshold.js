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

const max = 'kdWarnThreshold';
// CSS class that is added to input container when field value meets warning condition
const kdWarningClass = 'kd-warning';

/**
 * Returns true if input number is bigger than max allowed number provided as attribute and
 * there is no warning already set, false otherwise.
 *
 * @param {!angular.NgModelController} inputCtrl
 * @param {!angular.Attributes} attributes - directive attributes (have to contain kdWarnThreshold)
 * @return {boolean}
 */
export function shouldSetWarning(inputCtrl, attributes) {
  /** @type {number} */
  let number = parseInt(inputCtrl.$viewValue, 10);

  return number > attributes[max];
}

/**
 * Returns true if input number is lower or equal to max allowed number provided as attribute
 * and there is still a warning set, false otherwise.
 *
 * @param {!angular.NgModelController} inputCtrl
 * @param {!angular.Attributes} attributes - directive attributes (have to contain kdWarnThreshold)
 * @return {boolean}
 */
export function shouldRemoveWarning(inputCtrl, attributes) {
  return hasWarning(inputCtrl) && !shouldSetWarning(inputCtrl, attributes);
}

/**
 * Sets warning attribute on input controller and adds kd-warning css class to input container.
 *
 * @param {!angular.JQLite} inputContainer
 * @param {!angular.NgModelController} inputCtrl
 */
export function setWarning(inputContainer, inputCtrl) {
  inputCtrl[max] = true;
  inputContainer.addClass(kdWarningClass);
}

/**
 * Removes warning attribute from input controller and removes kd-warning class from input
 * container.
 *
 * @param {!angular.JQLite} inputContainer
 * @param {!angular.NgModelController} inputCtrl
 */
export function removeWarning(inputContainer, inputCtrl) {
  inputCtrl[max] = false;
  inputContainer.removeClass(kdWarningClass);
}

/**
 * Returns true if kdWarnThreshold attribute is set to true on input controller, false otherwise.
 *
 * @param {!angular.NgModelController} inputCtrl
 * @return {boolean}
 */
function hasWarning(inputCtrl) {
  return inputCtrl[max];
}
