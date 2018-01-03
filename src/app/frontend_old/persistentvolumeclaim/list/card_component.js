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
import {stateName} from '../../persistentvolumeclaim/detail/state';

/**
 * Controller for the persistent volume claim card.
 * @final
 */
class PersistentVolumeClaimCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.PersistentVolumeClaim}
     */
    this.persistentVolumeClaim;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @return {string}
   * @export
   */
  getPersistentVolumeClaimDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(
            this.persistentVolumeClaim.objectMeta.namespace,
            this.persistentVolumeClaim.objectMeta.name));
  }

  /**
   * Returns true if persistent volume claim is in bound state, false otherwise.
   * @return {boolean}
     @export
   */
  isBound() {
    return this.persistentVolumeClaim.status === 'Bound';
  }

  /**
   * Returns true if persistent volume claim is in pending state, false otherwise.
   * @return {boolean}
   * @export
   */
  isPending() {
    return this.persistentVolumeClaim.status === 'Pending';
  }

  /**
   * Returns true if persistent volume claim is in lost state, false otherwise.
   * @return {boolean}
   * @export
   */
  isLost() {
    return this.persistentVolumeClaim.status === 'Lost';
  }
}

/**
 * @return {!angular.Component}
 */
export const persistentVolumeClaimCardComponent = {
  bindings: {
    'persistentVolumeClaim': '=',
  },
  controller: PersistentVolumeClaimCardController,
  templateUrl: 'persistentvolumeclaim/list/card.html',
};
