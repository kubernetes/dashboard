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

import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

/**
 * @final
 */
export class NavService {
  /**
   * @param {!./../../common/state/futurestate_service.FutureStateService} kdFutureStateService
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor(kdFutureStateService, $state) {
    /** @private {!Array<string>} */
    this.states_ = [];

    /** @private {./nav_component.NavController} */
    this.navComponent_ = null;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./../../common/state/futurestate_service.FutureStateService} */
    this.kdFutureStateService_ = kdFutureStateService;
  }

  /**
   * @param {!./nav_component.NavController} navComponent
   */
  registerNav(navComponent) {
    this.navComponent_ = navComponent;
  }

  /**
   * Registers state in the global list of all nav states.
   * @param {string} stateName
   */
  registerState(stateName) {
    this.states_.push(stateName);
  }

  /**
   * Returns true when the given nav state is active.
   * @param {string} stateName
   * @return {boolean}
   */
  isActive(stateName) {
    let state = this.kdFutureStateService_.state;
    while (state) {
      let lastIndex = this.states_.lastIndexOf(state.name);
      if (lastIndex !== -1) {
        return this.states_[lastIndex] === stateName;
      }

      if (state.data && state.data[breadcrumbsConfig]) {
        state = this.state_.get(state.data[breadcrumbsConfig]['parent']);
      } else {
        state = null;
      }
    }
    return false;
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
