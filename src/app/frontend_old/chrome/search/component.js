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

import {stateName} from '../../search/state';

/**
 * @final
 */
export class SearchController {
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

    /** @export {string} */
    this.query = '';
  }

  /**
   * Register state change listener to empty search bar with every state change.
   */
  $onInit() {
    this.transitions_.onStart({}, () => {
      this.clear();
    });
  }

  /**
   * @export
   */
  clear() {
    this.query = '';
  }

  /**
   * @export
   */
  submit() {
    this.state_.go(stateName, {q: this.query});
  }
}

/** @type {!angular.Component} */
export const searchComponent = {
  controller: SearchController,
  templateUrl: 'chrome/search/search.html',
};
