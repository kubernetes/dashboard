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
import {stateName} from '../../storageclass/detail/state';

/**
 * Controller for the storage class card.
 *
 * @final
 */
class StorageClassCardController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.StorageClass}
     */
    this.storageClass;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {string}
   * @export
   */
  getStorageClassDetailHref() {
    return this.state_.href(stateName, new StateParams('', this.storageClass.objectMeta.name));
  }
}

/**
 * @return {!angular.Component}
 */
export const storageClassCardComponent = {
  bindings: {
    'storageClass': '=',
  },
  controller: StorageClassCardController,
  templateUrl: 'storageclass/list/card.html',
};
