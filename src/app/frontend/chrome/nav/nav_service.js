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
export class NavService {
  /**
   * @ngInject
   */
  constructor() {
    /** @private {./nav_component.NavController} */
    this.navComponent_ = null;
  }

  /**
   * @param {!./nav_component.NavController} navComponent
   */
  registerNav(navComponent) {
    this.navComponent_ = navComponent;
  }

  /**
   */
  toggle() {
    if (this.navComponent_) {
      this.navComponent_.toggle();
    } else {
      throw new Error('Navigation menu is not registered. This is likely a programming error.');
    }
  }
}
