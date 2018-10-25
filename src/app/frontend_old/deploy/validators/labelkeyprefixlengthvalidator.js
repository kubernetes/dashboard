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

import {Validator} from '../../common/validators/validator';

/**
 * @final
 * @extends {Validator}
 */
export class LabelKeyPrefixLengthValidator extends Validator {
  constructor() {
    super();
    /** @type {number} */
    this.maxKeyLength = 253;
  }

  /**
   * Returns true if the label key prefix (before the "/" if there is one) is equal or shorter than
   * 253 characters, otherwise returns false.
   *
   * @override
   */
  isValid(value) {
    /** @type {number} */
    let slashPosition = value.indexOf('/');
    /** @type {string} */
    let labelKeyPrefix = slashPosition > -1 ? value.substring(0, slashPosition) : '';

    return labelKeyPrefix.length <= this.maxKeyLength;
  }
}
