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
 * @final
 */
export class HistoryService {
  /**
   * @param {!ui.router.$state} $state
   * @param {!kdUiRouter.$transitions} $transitions
   * @ngInject
   */
  constructor($state, $transitions) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /** @private {!kdUiRouter.$transitions} */
    this.transitions_ = $transitions;
    /** @private {string} */
    this.previousStateName_ = '';
    /** @private {Object} */
    this.previousStateParams_ = null;
  }

  /** Initializes the service. Must be called before use. */
  init() {
    this.transitions_.onSuccess({}, ($transition$) => {
      this.previousStateName_ = $transition$.from().name || '';
      this.previousStateParams_ = $transition$.params('from');
    });
  }

  /**
   * Goes back to previous state or to the provided default if none set.
   * @param {string} defaultState
   */
  back(defaultState) {
    let targetState = this.previousStateName_ || defaultState;

    // If previous state is same as current state then go to default state to avoid loop.
    if (this.state_.current.name === this.previousStateName_) {
      targetState = defaultState;
    }

    this.state_.go(targetState, this.previousStateParams_);
  }
}
