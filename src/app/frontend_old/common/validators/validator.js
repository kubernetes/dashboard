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

// As this is abstract class then we have to allow unused variables in methods
/*eslint no-unused-vars: 0*/

/**
 * Abstract class representing Validator.
 *
 * @class
 */
export class Validator {
  constructor() {
    if (this.constructor === Validator) {
      throw new TypeError('Abstract class "Validator" cannot be instantiated directly.');
    }
  }

  /**
   * Should be implemented to return true when the given value meets the requirements
   * of the expected Type or given value is undefined|empty in order to not conflict with
   * other check such as 'required', false otherwise.
   *
   * @param {*} value
   * @return {boolean}
   */
  isValid(value) {}
}
