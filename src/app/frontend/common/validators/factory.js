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

import {IntegerValidator} from './integervalidator';

/**
 * Validators factory allows to register component related validators on demand in place where
 * they are used. Simply inject 'kdValidatorFactory' into controller and register validator
 * using 'registerValidator' method.
 *
 * Validator object has to fulfill validator object contract which is to implement 'Validator'
 * class and 'isValid(value)' method.
 *
 * @final
 */
export class ValidatorFactory {
  /**
   * @constructs ValidatorFactory
   */
  constructor() {
    /** @private {Map<string, !./validator.Validator>} */
    this.validatorMap_ = new Map();

    // Register common validators here
    this.registerValidator('integer', new IntegerValidator());
  }

  /**
   * Used to register validators on demand.
   *
   * @param {string} validatorName
   * @param {!./validator.Validator} validatorObject
   */
  registerValidator(validatorName, validatorObject) {
    if (this.validatorMap_.has(validatorName)) {
      throw new Error(`Validator with name ${validatorName} is already registered.`);
    }

    this.validatorMap_.set(validatorName, validatorObject);
  }

  /**
   * Returns specific Type class based on given type name.
   *
   * @param {string} validatorName
   * @returns {!./validator.Validator}
   */
  getValidator(validatorName) {
    let validatorObject = this.validatorMap_.get(validatorName);

    if (!validatorObject) {
      throw new Error(`Given validator '${validatorName}' is not supported.`);
    }

    return validatorObject;
  }
}
