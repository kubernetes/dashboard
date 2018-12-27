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

/**
 * description:
 * `<input kd-validate>` can be used to validate if value of the input field meets given Type
 * restrictions
 *
 * Params:
 *    - kdValidate {string} Information about type of data that can be provided to related input
 *    field i.e.: integer, appName, pullSecret
 *
 * usage:
 *  `<input type="number" kd-validate="integer">`
 *  `<input type="string" kd-validate="labelKeyNameLength">`
 *  `<input type="string" kd-validate="labelKeyNamePattern">`
 *  `<input type="string" kd-validate="labelKeyPrefixLength">`
 *  `<input type="string" kd-validate="labelKeyPrefixPattern">`
 *  `<input type="string" kd-validate="labelKeyNameLength">`
 *
 * @param {!./factory.ValidatorFactory} kdValidatorFactory
 * @return {!angular.Directive}
 * @ngInject
 */
export default function validateDirective(kdValidatorFactory) {
  const validateValidator = 'kdValidate';

  return {
    restrict: 'A',
    require: 'ngModel',
    /**
     * @param {!angular.Scope} scope
     * @param {!angular.JQLite} element
     * @param {!angular.Attributes} attrs
     * @param {!angular.NgModelController} ctrl
     */
    link: (scope, element, attrs, ctrl) => {
      let validateValidatorNames = attrs[validateValidator].split(',');

      validateValidatorNames.forEach((validateValidatorName) => {
        validateValidatorName = validateValidatorName.trim();
        /** @type {!./validator.Validator} */
        let validator = kdValidatorFactory.getValidator(validateValidatorName);
        // To preserve camel case on validator name
        let validatorName =
            `kdValid${validateValidatorName[0].toUpperCase()}${validateValidatorName.substr(1)}`;

        ctrl.$validators[validatorName] = (value) => {
          return validator.isValid(value);
        };
      });
    },
  };
}
