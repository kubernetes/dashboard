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

/**
 * Controller for the logs button component.
 * @final
 */
export class LogsButtonController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @export {string} Initialized from a binding. */
    this.resourceKindName;

    /** @export {!backendApi.ObjectMeta} Initialized from a binding. */
    this.objectMeta;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;
  }

  /**
   * @return {string}
   * @export
   */
  getLogsHref() {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.objectMeta.namespace, this.objectMeta.name, this.resourceKindName));
  }
}

/** @type {!angular.Component} */
export const logsButtonComponent = {
  templateUrl: 'common/components/resourcecard/logsbutton.html',
  bindings: {
    'resourceKindName': '<',
    'objectMeta': '<',
  },
  bindToController: true,
  controller: LogsButtonController,
};
