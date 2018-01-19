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

import {GlobalStateParams} from '../../common/resource/globalresourcedetail';
import {stateName as persistentVolumeStateName} from '../../persistentvolume/detail/state';
import {stateName as storageClassStateName} from '../../storageclass/detail/state';

/**
 * @final
 */
class PersistentVolumeClaimInfoController {
  /**
   * Constructs persistent volume claim controller info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Persistent Volume Claim details. Initialized from the scope.
     * @export {!backendApi.PersistentVolumeClaimDetail}
     */
    this.persistentVolumeClaim;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * Returns link to persistentvolume details page.
   * @return {string}
   * @export
   */
  getPersistentVolumeDetailsHref() {
    return this.state_.href(
        persistentVolumeStateName, new GlobalStateParams(this.persistentVolumeClaim.volume));
  }

  /**
   * Returns link to storageclass details page.
   * @return {string}
   * @export
   */
  getStorageClassDetailsHref() {
    return this.state_.href(
        storageClassStateName, new GlobalStateParams(this.persistentVolumeClaim.storageClass));
  }
}

/**
 * Definition object for the component that displays persistent volume claim info.
 *
 * @return {!angular.Component}
 */
export const persistentVolumeClaimInfoComponent = {
  controller: PersistentVolumeClaimInfoController,
  templateUrl: 'persistentvolumeclaim/detail/info.html',
  bindings: {
    /** {!backendApi.PersistentVolumeClaimDetail} */
    'persistentVolumeClaim': '=',
  },
};
