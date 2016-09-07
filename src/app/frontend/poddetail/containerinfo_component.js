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

import {StateParams} from 'common/resource/resourcedetail';
import {stateName as configMapState} from 'configmapdetail/configmapdetail_state';
import {stateName as logsStateName, StateParams as LogsStateParams} from 'logs/logs_state';

/**
 * @final
 */
export default class ContainerInfoController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from a binding
     * @export {string}
     */
    this.podName;
    /**
     * Initialized from a binding.
     * @export {!Array<!backendApi.Container>}
     */
    this.containers;

    /** @export {string} Initialized from a binding. */
    this.namespace;

    /** @export */
    this.i18n = i18n;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @param {!backendApi.ConfigMapKeyRef} configMapKeyRef
   * @return {string}
   * @export
   */
  getEnvConfigMapHref(configMapKeyRef) {
    return this.state_.href(configMapState, new StateParams(this.namespace, configMapKeyRef.Name));
  }

  /**
   * @param {!backendApi.Container} container
   * @return {string}
   * @export
   */
  getLogsHref(container) {
    return this.state_.href(
        logsStateName, new LogsStateParams(this.namespace, this.podName, container.name));
  }
}

/**
 * @type {!angular.Component}
 */
export const containerInfoComponent = {
  controller: ContainerInfoController,
  templateUrl: 'poddetail/containerinfo.html',
  bindings: {
    /** {!Array<backendApi.Container>} */
    'containers': '<',
    /** {string} */
    'namespace': '<',
    /** {string} */
    'podName': '<',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle at the top of the container details. */
  MSG_CONTAINER_DETAILS_SUBTITLE: goog.getMsg('Containers'),
  /** @export {string} @desc Label for container image. */
  MSG_CONTAINER_DETAILS_IMAGE: goog.getMsg('Image'),
  /** @export {string} @desc Label for container environment variables. */
  MSG_CONTAINER_DETAILS_ENV_VARS: goog.getMsg('Environment variables'),
  /** @export {string} @desc Label when there is no container environment variables. */
  MSG_CONTAINER_DETAILS_NO_ENV_VARS: goog.getMsg('-'),
  /** @export {string} @desc Label for container commands. */
  MSG_CONTAINER_DETAILS_COMMANDS: goog.getMsg('Commands'),
  /** @export {string} @desc Label when there is no container commands. */
  MSG_CONTAINER_DETAILS_NO_COMMANDS: goog.getMsg('-'),
  /** @export {string} @desc Label for container args. */
  MSG_CONTAINER_DETAILS_ARGS: goog.getMsg('Args'),
  /** @export {string} @desc Label when there is no container arguments. */
  MSG_CONTAINER_DETAILS_NO_ARGS: goog.getMsg('-'),
  /** @export {string} @desc Label for the container logs */
  MSG_CONTAINER_DETAILS_LOGS: goog.getMsg('View logs'),
  /**
   * @param {!backendApi.ConfigMapKeyRef} configMapKeyRef
   * @return {string}
   * @export
   */
  getConfigMapLabel: function(configMapKeyRef) {
    /** @desc Label for environment variable that comes from a Config Map */
    let MSG_ENV_FROM_CONFIG_MAP = goog.getMsg(
        'value from ConfigMap {$name}/{$key}',
        {'name': configMapKeyRef.Name, 'key': configMapKeyRef.key});

    return MSG_ENV_FROM_CONFIG_MAP;
  },
};
