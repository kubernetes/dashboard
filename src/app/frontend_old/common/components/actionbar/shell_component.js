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

import {stateName as shellStateName} from '../../../shell/state';
import {StateParams} from '../../resource/resourcedetail';

/**
 * @final
 */
class ActionbarShellButtonController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$window} $window
   * @ngInject
   */
  constructor($state, $window) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /** @private {!angular.$window} */
    this.window_ = $window;
    /** @export {string} */
    this.namespace;
    /** @export {string} */
    this.podName;
  }

  /** @export */
  openShell() {
    let shellPageLink =
        this.state_.href(shellStateName, new StateParams(this.namespace, this.podName));
    this.window_.open(shellPageLink, '_blank');
  }
}

/**
 * Component for exec into pod button on pod detail page actionbar.
 * @type {!angular.Component}
 */
export const actionbarShellButtonComponent = {
  controller: ActionbarShellButtonController,
  bindings: {
    'namespace': '<',
    'podName': '<',
  },
  templateUrl: 'common/components/actionbar/shell.html',
};
