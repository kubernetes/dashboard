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

import {stateName as logs, StateParams} from './../logs_state';

/**
 * Controller for the logs view.
 * @final
 */
export default class LogsToolbarController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!StateParams} $stateParams
   * @param {!../logs_service.LogsService} logsService
   * @ngInject
   */
  constructor($state, $stateParams, podContainers, logsService) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /**
     * Service to notify logs controller if any changes on toolbar.
     * @private {!../logs_service.LogsService}
     */
    this.logsService_ = logsService;

    /** @export {!Array<string>} */
    this.containers = podContainers.containers;

    /** @export {string} */
    this.container = $stateParams.container || this.containers[0];

    /** @export {../logs_state.StateParams} */
    this.stateParams = $stateParams;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Execute a code when a user changes the selected option of a container element.
   * @param {string} container
   * @export
   */
  onContainerChange(container) {
    this.state_.go(
        logs,
        new StateParams(this.stateParams.objectNamespace, this.stateParams.objectName, container));
  }

  /**
   * Return proper style class for text color icon.
   * @export
   * @returns {string}
   */
  getColorIconClass() {
    const logsTextColor = 'kd-logs-color-icon';
    if (this.logsService_.getInverted()) {
      return `${logsTextColor}-invert`;
    } else {
      return logsTextColor;
    }
  }

  /**
   * Return proper style class for font size icon.
   * @export
   * @returns {string}
   */
  getSizeIconClass() {
    const logsTextColor = 'kd-logs-size-icon';
    if (this.logsService_.getCompact()) {
      return `${logsTextColor}-compact`;
    } else {
      return logsTextColor;
    }
  }

  /**
   * Execute a code when a user changes the selected option for console font size.
   * @export
   */
  onFontSizeChange() { this.logsService_.setCompact(); }

  /**
   * Execute a code when a user changes the selected option for console color.
   * @export
   */
  onTextColorChange() { this.logsService_.setInverted(); }

  /**
   * Find Pod by name.
   * Return object or undefined if can not find a object.
   * @param {!Array<!backendApi.ReplicationControllerPodWithContainers>} array
   * @param {!string} name
   * @return {!backendApi.ReplicationControllerPodWithContainers|undefined}
   * @private
   */
  findPodByName_(array, name) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name) {
        return array[i];
      }
    }
    return undefined;
  }

  /**
   * Find Container by name.
   * Return object or undefined if can not find a object.
   * @param {!Array<!backendApi.PodContainer>} array
   * @param {string} name
   * @return {!backendApi.PodContainer}
   * @private
   */
  initializeContainer_(array, name) {
    let container = undefined;
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name) {
        container = array[i];
        break;
      }
    }
    if (!container) {
      container = array[0];
    }
    return container;
  }
}

const i18n = {
  /** @export {string} @desc Label 'Pod' on the toolbar of the logs page. Ends with colon. */
  MSG_LOGS_POD_LABEL: goog.getMsg('Pod:'),
  /** @export {string} @desc Label 'Container' on the toolbar of the logs page. Ends with colon. */
  MSG_LOGS_CONTAINER_LABEL: goog.getMsg('Container:'),
};
