// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


export class MainController {
  constructor() {
    /** @export */
    this.testValue = 7;
  }

  /**
   * @param {!angular.$timeout} $timeout
   * @ngInject
   * @export
   */
  activate($timeout) {
    $timeout(() => {
      this.testValue = 8;
    }, 4000);
  }
}
