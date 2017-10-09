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

import {stateName as logsStateName, StateParams as LogsStateParams} from '../../../logs/state';

export class ActionbarLogsItemController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$window} $window
   * @ngInject
   */
  constructor($state, $window) {
    /** @export {string} Initialized from a binding. */
    this.resourceKindName;

    /** @export {!backendApi.ObjectMeta} Initialized from a binding. */
    this.objectMeta;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;

    /** @private {!angular.$window} */
    this.window_ = $window;
  }

  /**
   * Open the logs view in a new window.
   * @export
   */
  viewLogs() {
    let logsLink = this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.objectMeta.namespace, this.objectMeta.name, this.resourceKindName));

    this.window_.open(logsLink, '_blank');
  }
}

/**
 * Action bar logs component should be used only on resource details page in order to
 * add button that allows to see logs of this resource.
 *
 * @type {!angular.Component}
 */
export const actionbarLogsComponent = {
  controller: ActionbarLogsItemController,
  templateUrl: 'common/components/actionbar/actionbarlogs.html',
  bindings: {
    'resourceKindName': '<',
    'objectMeta': '<',
  },
};
