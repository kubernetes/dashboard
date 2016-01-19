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

import {StateParams, stateName as logs} from './../logs_state';

/**
 * Controller for the logs view.
 * @final
 */
export default class LogsToolbarController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!StateParams} $stateParams
   * @param {!backendApi.ReplicaSetPods} replicaSetPods
   * @param {!backendApi.Logs} podLogs
   * @param {!../logs_service.LogColorInversionService} logsColorInversionService
   * @ngInject
   */
  constructor($state, $stateParams, replicaSetPods, podLogs, logsColorInversionService) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /**
     * Service to notify logs controller if any changes on toolbar.
     * @private {!../logs_service.LogColorInversionService}
     */
    this.logsColorInversionService_ = logsColorInversionService;

    /** @export {!Array<!backendApi.ReplicaSetPodWithContainers>} */
    this.pods = replicaSetPods.pods;

    /**
     * Currently chosen pod.
     * @export {!backendApi.ReplicaSetPodWithContainers|undefined}
     */
    this.pod = this.findPodByName_(this.pods, $stateParams.podId);

    /** @export {!Array<!backendApi.PodContainer>} */
    this.containers = this.pod.podContainers;

    /** @export {!backendApi.PodContainer} */
    this.container = this.initializeContainer_(this.containers, podLogs.container);

    /**
     * Pod creation time.
     * @export {?string}
     */
    this.podCreationTime = this.pod.startTime;

    /**
     * Namespace.
     * @private {string}
     */
    this.namespace_ = $stateParams.namespace;

    /**
     * Replica Set name.
     * @private {string}
     */
    this.replicaSetName_ = $stateParams.replicaSet;
  }

  /**
   * Indicates state of log area color.
   * If false: black text is placed on white area. Otherwise colors are inverted.
   * @export
   * @return {boolean}
   */
  isTextColorInverted() { return this.logsColorInversionService_.getInverted(); }

  /**
   * Execute a code when a user changes the selected option of a pod element.
   * @param {string} podId
   * @return {string}
   * @export
   */
  onPodChange(podId) {
    return this.state_.transitionTo(
        logs, new StateParams(this.namespace_, this.replicaSetName_, podId, this.container.name));
  }

  /**
   * Execute a code when a user changes the selected option of a container element.
   * @param {string} container
   * @return {string}
   * @export
   */
  onContainerChange(container) {
    return this.state_.transitionTo(
        logs, new StateParams(this.namespace_, this.replicaSetName_, this.pod.name, container));
  }

  /**
   * Return proper style class for icon.
   * @export
   * @returns {string}
   */
  getStyleClass() {
    const logsTextColor = 'kd-logs-color-icon';
    if (this.isTextColorInverted()) {
      return `${logsTextColor}-invert`;
    }
    return `${logsTextColor}`;
  }

  /**
   * Execute a code when a user changes the selected option for console color.
   * @export
   */
  onTextColorChange() { this.logsColorInversionService_.invert(); }

  /**
   * Find Pod by name.
   * Return object or undefined if can not find a object.
   * @param {!Array<!backendApi.ReplicaSetPodWithContainers>} array
   * @param {!string} name
   * @return {!backendApi.ReplicaSetPodWithContainers|undefined}
   * @private
   */
  findPodByName_(array, name) { return array.find((element) => element.name === name); }

  /**
   * Find Container by name.
   * Return object or undefined if can not find a object.
   * @param {!Array<!backendApi.PodContainer>} array
   * @param {string} name
   * @return {!backendApi.PodContainer}
   * @private
   */
  initializeContainer_(array, name) {
    let container = array.find((element) => element.name === name);
    if (!container) {
      container = array[0];
    }
    return container;
  }
}
