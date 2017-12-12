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
 * Represents label object used in deploy form view.
 * @final
 */
export default class DeployLabel {
  /**
   * @param {string} key
   * @param {string} value
   * @param {boolean} editable
   * @param {function(string): string|undefined} derivedValueGetterFn
   */
  constructor(key = '', value = '', editable = true, derivedValueGetterFn = undefined) {
    /** @export {boolean} */
    this.editable = editable;

    /** @export {string} */
    this.key = key;

    /** @private {string} */
    this.value_ = value;

    /** @private {function(string): string|undefined} */
    this.derivedValueGetter_ = derivedValueGetterFn;
  }

  /**
   * @param {string=} [newValue]
   * @return {string}
   * @export
   */
  value(newValue) {
    if (this.derivedValueGetter_ !== undefined) {
      if (newValue !== undefined) {
        throw Error('Can not set value of derived label.');
      }
      return this.derivedValueGetter_(this.key);
    }
    return newValue !== undefined ? (this.value_ = newValue) : this.value_;
  }

  /**
   * Converts 'this' object to backendApi.Label object.
   * @return {!backendApi.Label}
   * @export
   */
  toBackendApi() {
    return {
      key: this.key,
      value: this.value(),
    };
  }
}
