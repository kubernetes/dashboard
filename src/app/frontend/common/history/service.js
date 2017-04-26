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

import {baseStateName as deployState} from 'deploy/state';

/**
 * @final
 */
export class HistoryService {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.Scope} $rootScope
   * @ngInject
   */
  constructor($state, $rootScope) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /** @private {!angular.Scope} */
    this.scope_ = $rootScope;
    /** @private {string} */
    this.previousStateName_ = '';
    /** @private {Object} */
    this.previousStateParams_ = null;
  }

  /** Initializes the service. Must be called before use. */
  init() {
    this.scope_.$on(
        '$stateChangeSuccess',
        (event, toState, toParams, /** !ui.router.State */ fromState, fromParams) => {
          let prevName = fromState.name || '';
          // Skip deploy states from history. They are not relevant now. This may change later.
          if (prevName.indexOf(deployState) === -1) {
            this.previousStateName_ = prevName;
            this.previousStateParams_ = fromParams;
          }
        });
  }

  /**
   * Goes back to previous state or to the provided default if none set.
   * @param {string} defaultState
   */
  back(defaultState) {
    this.state_.go(this.previousStateName_ || defaultState, this.previousStateParams_);
  }
}
