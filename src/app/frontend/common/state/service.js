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
 * Service that tracks future and current states, event at the time of transition.
 * Use it when a component needs to update itself to a future state, even
 * if it is not fully loaded.
 * @final
 */
export class FutureStateService {
  /**
   * @param {!angular.Scope} $rootScope
   * @ngInject
   */
  constructor($rootScope) {
    /** @private {!angular.Scope} */
    this.scope_ = $rootScope;

    /** @type {ui.router.$state} */
    this.state = null;

    /** @type {Object<string, string>} */
    this.params = null;
  }

  /**
   * Initializes the service to track future and current state.
   */
  init() {
    this.scope_.$on('$stateChangeStart', (event, toState, toParams) => {
      this.state = toState;
      this.params = toParams;
    });
  }
}
