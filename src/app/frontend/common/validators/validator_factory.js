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

import {IntegerValidator} from './integervalidator';
import {LabelKeyNameLengthValidator} from 'deploy/validators/labelkeynamelengthvalidator';
import {LabelKeyPrefixLengthValidator} from 'deploy/validators/labelkeyprefixlengthvalidator';
import {LabelKeyNamePatternValidator} from 'deploy/validators/labelkeynamepatternvalidator';
import {LabelKeyPrefixPatternValidator} from 'deploy/validators/labelkeyprefixpatternvalidator';
import {LabelValuePatternValidator} from 'deploy/validators/labelvaluepatternvalidator';

/**
 * @final
 */
export class ValidatorFactory {
  /**
   * @constructs ValidatorFactory
   */
  constructor() {
    /** @private {Map<Array<string, !./validator.Validator>>} */
    this.validatorMap_ = new Map();

    // Initialize map with supported types
    this.validatorMap_.set('integer', new IntegerValidator());
    this.validatorMap_.set('labelKeyNameLength', new LabelKeyNameLengthValidator());
    this.validatorMap_.set('labelKeyPrefixLength', new LabelKeyPrefixLengthValidator());
    this.validatorMap_.set('labelKeyNamePattern', new LabelKeyNamePatternValidator());
    this.validatorMap_.set('labelKeyPrefixPattern', new LabelKeyPrefixPatternValidator());
    this.validatorMap_.set('labelValuePattern', new LabelValuePatternValidator());
  }

  /**
   * Returns specific Type class based on given type name.
   *
   * @method
   * @param validatorName
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
