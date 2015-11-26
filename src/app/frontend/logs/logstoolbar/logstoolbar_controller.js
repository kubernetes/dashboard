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
 * Controller for the logs view.
 * @final
 */
export default class LogsToolbarController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!backendApi.ReplicaSetPods} replicaSetPods
   * @param {!../logs_service.LogColorInversionService} logsColorInversionService
   * @ngInject
   */
  constructor($state, replicaSetPods, logsColorInversionService) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    // TODO(zreigz): should be StateParam but can not be import from logstoolbar_state. Issue 153.
    /** @private {!Object.<string, string, string, string>|null} */
    this.params = this.state_.params;

    /**
     * Service to notify logs controller if any changes on toolbar.
     * @private {!../logs_service.LogColorInversionService}
     */
    this.logsColorInversionService = logsColorInversionService;

    /** @export {!Array<!backendApi.ReplicaSetPodWithContainers>} */
    this.pods = replicaSetPods.pods || [];

    /**
     * Currently chosen pod.
     * @export {!backendApi.ReplicaSetPodWithContainers|undefined}
     */
    this.pod = this.findPodByName_(this.pods, this.params.podId);

    /** @export {!Array<!backendApi.PodContainer>} */
    this.containers = this.pod.podContainers || [];

    /** @export {!backendApi.PodContainer|undefined} */
    this.container = this.findContainerByName_(this.containers, this.params.container);

    /**
     * Pod creation time.
     * @export {string}
     */
    this.podCreationTime = new Date(Date.parse(this.pod.startTime)).toLocaleString();

    /**
     * Namespace.
     * @private {string}
     */
    this.namespace = this.params.namespace;

    /**
     * Replica Set name.
     * @private {string}
     */
    this.replicaSetName = this.params.replicaSet;

    /**
     * Indicates state of log area color.
     * If false: black text is placed on white area. Otherwise colors are inverted.
     * @export
     * @return {boolean}
     */
    this.isTextColorInverted = function() { return this.logsColorInversionService.getInverted(); };
  }

  /**
   * Execute a code when a user changes the selected option of a pod element.
   * @param {string} podId
   * @return {string}
   * @export
   */
  onPodChange(podId) {
    // TODO(zreigz): state name and StateParam can not be import from logstoolbar_state. Issue 153.
    return this.state_.transitionTo("logs", {
      namespace: this.namespace,
      replicaSet: this.replicaSetName,
      podId: podId,
      container: this.container.name,
    });
  }

  /**
   * Execute a code when a user changes the selected option of a container element.
   * @param {string} container
   * @return {string}
   * @export
   */
  onContainerChange(container) {
    // TODO(zreigz): state name and StateParam can not be import from logstoolbar_state. Issue 153.
    return this.state_.transitionTo("logs", {
      namespace: this.namespace,
      replicaSet: this.replicaSetName,
      podId: this.pod.name,
      container: container,
    });
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
  onTextColorChange() { this.logsColorInversionService.invert(); }

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
   * @param {!string} name
   * @return {!backendApi.PodContainer|undefined}
   * @private
   */
  findContainerByName_(array, name) { return array.find((element) => element.name === name); }
}
