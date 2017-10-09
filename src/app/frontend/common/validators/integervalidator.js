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

import {Validator} from './validator';

/**
 * @final
 * @extends {Validator}
 */
export class IntegerValidator extends Validator {
  constructor() {
    super();
  }

  /**
   * Returns true if given value is a correct integer value, false otherwise.
   * When value is undefined or empty then it is considered as correct value in order
   * to not conflict with other validations like 'required'.
   *
   * @override
   */
  isValid(value) {
    return (Number(value) === value && value % 1 === 0) || !value;
  }
}
