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
 * @final
 */
export default class ConditionsController {
  /**
   * Constructs conditions controller.
   * @ngInject
   */
  constructor() {
    /**
     * An array of {backendAPI.conditions} objects.
     * @export
     */
    this.conditions;
  }

  /**
   * Returns condition style name. Used to differ condition with true (default color) and false
   * status (muted color).
   * @param {backendAPI.condition} condition
   * @return {string}
   * @export
   */
  getConditionStyle(condition) {
    if (condition.status === 'False') {
      return 'kd-condition-muted';
    }
    return '';
  }
}
