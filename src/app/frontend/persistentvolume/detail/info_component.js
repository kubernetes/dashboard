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
import {StateParams} from '../../common/resource/resourcedetail';
import {stateName as persistentVolumeClaimStateName} from '../../persistentvolumeclaim/detail/state';
import {stateName as storageClassStateName} from '../../storageclass/detail/state';

/**
 * @final
 */
export default class PersistentVolumeInfoController {
  /**
   * Constructs statefultion controller info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Persistent volume details. Initialized from the scope.
     * @export {!backendApi.PersistentVolumeDetail}
     */
    this.persistentVolume;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * Returns link to persistentvolumeclaim details page.
   * @return {string}
   * @export
   */
  getPersistentVolumeClaimDetailsHref() {
    if (this.persistentVolume.claim) {
      let claim = this.persistentVolume.claim.split('/');
      if (claim.length >= 2) {
        return this.state_.href(
            persistentVolumeClaimStateName, new StateParams(claim[0], claim[1]));
      }
    }
    return '';
  }

  /**
   * Returns link to storageclass details page.
   * @return {string}
   * @export
   */
  getStorageClassDetailsHref() {
    return this.state_.href(
        storageClassStateName, new GlobalStateParams(this.persistentVolume.storageClass));
  }
}

/**
 * Definition object for the component that displays persistent volume info.
 *
 * @return {!angular.Component}
 */
export const persistentVolumeInfoComponent = {
  controller: PersistentVolumeInfoController,
  templateUrl: 'persistentvolume/detail/info.html',
  bindings: {
    /** {!backendApi.PersistentVolumeDetail} */
    'persistentVolume': '=',
  },
};
