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

/**
 * Service class for logs colors management.
 * @final
 */
export class LogColorInversionService {
  /**
   * @ngInject
   */
  constructor() {
    /** @private {boolean} */
    this.inverted_ = false;

    /** @private {string} */
    this.fontSize_ = '14px';
  }

  /**
   * Getter for invertion flag.
   * @return {boolean}
   */
  getInverted() { return this.inverted_; }

  /** Inverts the flag. */
  invert() { this.inverted_ = !this.inverted_; }

  /**
   * Setter for font size.
   * @param fontSize
   */
  setFontSize(fontSize) { this.fontSize_ = fontSize; }

  /**
   * Getter for font size.
   * @return {string}
   */
  getFontSize() { return this.fontSize_; }
}
