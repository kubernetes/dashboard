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
 * @final
 */
export default class PetSetInfoController {
  /**
   * Constructs pettion controller info object.
   */
  constructor() {
    /**
     * Pet set details. Initialized from the scope.
     * @export {!backendApi.PetSetDetail}
     */
    this.petSet;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.petSet.podInfo.running === this.petSet.podInfo.desired;
  }
}

/**
 * Definition object for the component that displays pet set info.
 *
 * @return {!angular.Directive}
 */
export const petSetInfoComponent = {
  controller: PetSetInfoController,
  templateUrl: 'petsetdetail/petsetinfo.html',
  bindings: {
    /** {!backendApi.PetSetDetail} */
    'petSet': '=',
  },
};
