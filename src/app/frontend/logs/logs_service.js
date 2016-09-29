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
 * Service class for logs management.
 * @final
 */
export class LogsService {
  /**
   * @ngInject
   */
  constructor() {
    /** @private {boolean} */
    this.inverted_ = true;

    /** @private {boolean} */
    this.compact_ = false;
  }

  /**
   * Getter for inverted flag.
   * @return {boolean}
   */
  getInverted() {
    return this.inverted_;
  }

  /**
   * Switches the inverted flag.
   */
  setInverted() {
    this.inverted_ = !this.inverted_;
  }

  /**
   * Switches the compact flag.
   */
  setCompact() {
    this.compact_ = !this.compact_;
  }

  /**
   * Getter for compact flag.
   * @return {boolean}
   */
  getCompact() {
    return this.compact_;
  }
}
