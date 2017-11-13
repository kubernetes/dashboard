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
import {stateName} from '../../persistentvolume/detail/state';
import {stateName as persistentVolumeClaimStateName} from '../../persistentvolumeclaim/detail/state';

/**
 * Controller for the persistent volume card.
 *
 * @final
 */
class PersistentVolumeCardController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.PersistentVolume}
     */
    this.persistentVolume;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {string}
   * @export
   */
  getPersistentVolumeDetailHref() {
    return this.state_.href(stateName, new StateParams('', this.persistentVolume.objectMeta.name));
  }

  /**
   * Returns link to persistentvolumeclaim to which this persistentvolume is associated.
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
}

/**
 * @return {!angular.Component}
 */
export const persistentVolumeCardComponent = {
  bindings: {
    'persistentVolume': '=',
  },
  controller: PersistentVolumeCardController,
  templateUrl: 'persistentvolume/list/card.html',
};
