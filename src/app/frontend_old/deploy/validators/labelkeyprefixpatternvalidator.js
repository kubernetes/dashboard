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
export class LabelKeyPrefixPatternValidator extends Validator {
  constructor() {
    super();
    /** @type {!RegExp} */
    this.labelKeyPrefixPattern =
        /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
  }

  /**
   * Returns true if the label key prefix (before the "/" if there is one) matches a lowercase
   * alphanumeric character optionally followed by lowercase alphanumeric or '-' or '.' and
   * ending with a lower case alphanumeric character, with '.' only permitted if surrounded
   * by lowercase alphanumeric characters (eg: 'good.prefix-pattern'), otherwise returns false.
   *
   * @override
   */
  isValid(value) {
    /** @type {number} */
    let slashPosition = value.indexOf('/');

    return slashPosition > -1 ? this.labelKeyPrefixPattern.test(value.substring(0, slashPosition)) :
                                true;
  }
}
