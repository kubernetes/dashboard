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

import {IntegerValidator} from 'common/validators/integervalidator';
import validatorsModule from 'common/validators/module';
import {LabelKeyNameLengthValidator} from 'deploy/validators/labelkeynamelengthvalidator';
import {LabelKeyNamePatternValidator} from 'deploy/validators/labelkeynamepatternvalidator';

describe('Validator factory', () => {
  /** @type {!ValidatorFactory} */
  let validatorFactory;

  beforeEach(() => {
    angular.mock.module(validatorsModule.name);

    angular.mock.inject((kdValidatorFactory) => {
      validatorFactory = kdValidatorFactory;
    });
  });

  it('should return integer type', () => {
    // given
    let validatorName = 'integer';

    // when
    let validatorObject = validatorFactory.getValidator(validatorName);

    // then
    expect(validatorObject).toEqual(jasmine.any(IntegerValidator));
  });

  it('should throw an error', () => {
    // given
    let validatorName = 'notExistingValidator';

    // then
    expect(() => {
      validatorFactory.getValidator(validatorName);
    }).toThrow(new Error(`Given validator '${validatorName}' is not supported.`));
  });

  it('should register validator', () => {
    // given
    let validator = new LabelKeyNameLengthValidator();

    // when
    validatorFactory.registerValidator('testValidator', validator);

    // then
    expect(validatorFactory.getValidator('testValidator')).toEqual(validator);
  });

  it('should throw an error when trying to override validator', () => {
    // given
    let nameValidator = new LabelKeyNameLengthValidator();
    let patternValidator = new LabelKeyNamePatternValidator();

    // when
    validatorFactory.registerValidator('testValidator', nameValidator);

    // then
    expect(() => {
      validatorFactory.registerValidator('testValidator', patternValidator);
    }).toThrow(new Error(`Validator with name testValidator is already registered.`));
  });
});
