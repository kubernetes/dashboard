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

import {StateParams} from '../../common/resource/resourcedetail';
import {stateName} from '../../pod/detail/state';

/**
 * @final
 */
export class PodCardController {
  /**
   * @ngInject,
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   */
  constructor($state, kdNamespaceService) {
    /** @private {!../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /**
     * Initialized from the scope.
     * @export {!backendApi.Pod}
     */
    this.pod;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * Returns true if this pod has warnings, false otherwise
   * @return {boolean}
   */
  hasWarnings() {
    return this.pod.warnings.length > 0;
  }

  /**
   * Returns true if this pod has no warnings and is in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    // podPhase should be Pending if init containers are running but we are being extra thorough.
    return this.pod.podStatus.status === 'Pending';
  }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return this.pod.podStatus.status === 'Succeeded' || this.pod.podStatus.status === 'Running';
  }

  /**
   * Checks if pod status is failed.
   * @return {boolean}
   * @export
   */
  isFailed() {
    return this.pod.podStatus.status === 'Failed';
  }

  /**
   * @return {string}
   * @export
   */
  getPodDetailHref() {
    return this.state_.href(
        stateName, new StateParams(this.pod.objectMeta.namespace, this.pod.objectMeta.name));
  }

  /**
   * Returns a displayable status message for the pod.
   * @return {string}
   * @export
   */
  getDisplayStatus() {
    // See kubectl printers.go for logic in kubectl.
    // https://github.com/kubernetes/kubernetes/blob/39857f486511bd8db81868185674e8b674b1aeb9/pkg/printers/internalversion/printers.go

    let msgState = 'running';
    let reason = undefined;

    // NOTE: Init container statuses are currently not taken into account.
    // However, init containers with errors will still show as failed because
    // of warnings.
    if (this.pod.podStatus.containerStates) {
      // Container states array may be null when no containers have
      // started yet.

      for (let i = this.pod.podStatus.containerStates.length - 1; i >= 0; i--) {
        let state = this.pod.podStatus.containerStates[i];

        if (state.waiting) {
          msgState = 'waiting';
          reason = state.waiting.reason;
        }
        if (state.terminated) {
          msgState = 'terminated';
          reason = state.terminated.reason;
          if (!reason) {
            if (state.terminated.signal) {
              reason = 'Signal:${state.terminated.signal}';
            } else {
              reason = 'ExitCode:${state.terminated.exitCode}';
            }
          }
        }
      }
    }

    /** @type {string} @desc Status message showing a waiting status with [reason].*/
    let MSG_POD_LIST_POD_WAITING_STATUS = goog.getMsg('Waiting: {$reason}', {'reason': reason});
    /** @type {string} @desc Status message showing a terminated status with [reason].*/
    let MSG_POD_LIST_POD_TERMINATED_STATUS =
        goog.getMsg('Terminated: {$reason}', {'reason': reason});

    if (msgState === 'waiting') {
      return MSG_POD_LIST_POD_WAITING_STATUS;
    }
    if (msgState === 'terminated') {
      return MSG_POD_LIST_POD_TERMINATED_STATUS;
    }
    return this.pod.podStatus.podPhase;
  }

  /**
   * @return {boolean}
   * @export
   */
  hasMemoryUsage() {
    return !!this.pod && !!this.pod.metrics && !!this.pod.metrics.memoryUsageHistory &&
        this.pod.metrics.memoryUsageHistory.length > 0;
  }

  /**
   * @return {boolean}
   * @export
   */
  hasCpuUsage() {
    return !!this.pod && !!this.pod.metrics && !!this.pod.metrics.cpuUsageHistory &&
        this.pod.metrics.cpuUsageHistory.length > 0;
  }
}

/**
 * @return {!angular.Component}
 */
export const podCardComponent = {
  bindings: {
    'pod': '=',
    'showMetrics': '<',
  },
  controller: PodCardController,
  templateUrl: 'pod/list/card.html',
};
