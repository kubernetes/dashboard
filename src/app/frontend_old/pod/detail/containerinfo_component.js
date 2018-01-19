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
import {stateName as configMapState} from '../../configmap/detail/state';
import {stateName as secretState} from '../../secret/detail/state';

/**
 * @final
 */
class ContainerInfoController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$window} $window
   * @ngInject
   */
  constructor($state, $window) {
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

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export {boolean} */
    this.isSecretVisible = false;

    /** @private {!angular.$window} */
    this.window_ = $window;
  }

  /**
   * @param {!backendApi.EnvVar} env
   * @return {string}
   * @export
   */
  getRefObjectHref(env) {
    if (!env.valueFrom) {
      return '';
    }

    if (env.valueFrom.configMapKeyRef) {
      return this.getEnvConfigMapHref(env.valueFrom.configMapKeyRef);
    }

    if (env.valueFrom.secretKeyRef) {
      return this.getEnvSecretHref(env.valueFrom.secretKeyRef);
    }

    return '';
  }

  /**
   * @param {!backendApi.EnvVar} env
   * @return {boolean}
   * @export
   */
  isSecret(env) {
    return !!env.valueFrom && !!env.valueFrom.secretKeyRef;
  }

  /** @export */
  showSecret() {
    this.isSecretVisible = true;
  }

  /**
   * @param {string} valueB64
   * @return {string}
   * @export
   */
  formatSecretValue(valueB64) {
    return this.window_.atob(valueB64);
  }

  /**
   * @param {string} valueB64
   * @return {string}
   * @export
   */
  formatDataValue(valueB64) {
    return this.window_.atob(valueB64);
  }

  /**
   * @param {!backendApi.EnvVar} env
   * @return {string}
   * @export
   */
  getRefObjectName(env) {
    return env.valueFrom.configMapKeyRef ? env.valueFrom.configMapKeyRef.name :
                                           env.valueFrom.secretKeyRef.name;
  }

  /**
   * @param {!backendApi.EnvVar} env
   * @return {boolean}
   * @export
   */
  isHref(env) {
    return !!env.valueFrom && (!!env.valueFrom.configMapKeyRef || !!env.valueFrom.secretKeyRef);
  }

  /**
   * @param {!backendApi.ConfigMapKeyRef} configMapKeyRef
   * @return {string}
   * @export
   */
  getEnvConfigMapHref(configMapKeyRef) {
    return this.state_.href(configMapState, new StateParams(this.namespace, configMapKeyRef.name));
  }

  /**
   * @param {!backendApi.SecretKeyRef} secretKeyRef
   * @return {string}
   * @export
   */
  getEnvSecretHref(secretKeyRef) {
    return this.state_.href(secretState, new StateParams(this.namespace, secretKeyRef.name));
  }
}

/**
 * @type {!angular.Component}
 */
export const containerInfoComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    'header': '?kdHeader',
  },
  controller: ContainerInfoController,
  templateUrl: 'pod/detail/containerinfo.html',
  bindings: {
    /** {!Array<backendApi.Container>} */
    'containers': '<',
    /** {string} */
    'namespace': '<',
    /** {string} */
    'podName': '<',
  },
};
