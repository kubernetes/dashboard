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

import {LabelKeyNameLengthValidator} from './validators/labelkeynamelengthvalidator';
import {LabelKeyNamePatternValidator} from './validators/labelkeynamepatternvalidator';
import {LabelKeyPrefixLengthValidator} from './validators/labelkeyprefixlengthvalidator';
import {LabelKeyPrefixPatternValidator} from './validators/labelkeyprefixpatternvalidator';
import {LabelValuePatternValidator} from './validators/labelvaluepatternvalidator';

/**
 * Configures deploy view related components.
 *
 * @param {!./../common/validators/validator_factory.ValidatorFactory} kdValidatorFactory
 * @ngInject
 */
export default function initConfig(kdValidatorFactory) {
  // Register label related validators
  kdValidatorFactory.registerValidator('labelKeyNameLength', new LabelKeyNameLengthValidator());
  kdValidatorFactory.registerValidator('labelKeyPrefixLength', new LabelKeyPrefixLengthValidator());
  kdValidatorFactory.registerValidator('labelKeyNamePattern', new LabelKeyNamePatternValidator());
  kdValidatorFactory.registerValidator(
      'labelKeyPrefixPattern', new LabelKeyPrefixPatternValidator());
  kdValidatorFactory.registerValidator('labelValuePattern', new LabelValuePatternValidator());
}
