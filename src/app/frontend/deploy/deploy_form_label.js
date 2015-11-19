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


export const APP_LABEL_KEY = 'app';
export const VERSION_LABEL_KEY = 'version';

/**
 * Represents label object used in deploy form view.
 * @class DeployFormLabel
 */
export default class DeployFormLabel {

  /**
   * Constructs DeployFormLabel object.
   * @param {string} key
   * @param {string} value
   * @param {boolean} editable
   */
  constructor(key = '', value = '', editable = true) {
    /** @export {boolean} */
    this.editable = editable;

    /** @export {string} */
    this.key = key;

    /** @export {string} */
    this.value = value;

    /** @export {boolean} */
    this.hasError = false;

    /** @export {boolean} */
    this.hovered = false;
  }

  /**
   * Converts 'this' object to backendApi.Label object.
   * @returns {!backendApi.Label}
   */
  toBackendApi() {
    return {
      key: this.key,
      value: this.value,
    };
  }
}
