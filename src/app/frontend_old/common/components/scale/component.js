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

/**
 * @final
 */
class ScaleButtonController {
  /**
   * @param {!../../scaling/service.ScaleService} kdScaleService
   * @ngInject
   */
  constructor(kdScaleService) {
    /** @private {../../scaling/service.ScaleService} */
    this.kdScaleService_ = kdScaleService;
    /** @export {boolean} - Initialized from binding */
    this.menuItem;
    /** @export {!backendApi.ObjectMeta} - Initialized from binding */
    this.objectMeta;
    /** @export {string} - Initialized from binding */
    this.resourceKindName;
    /** @export {string} - Initialized from binding */
    this.resourceKindDisplayName;
    /** @export {number} - Initialized from binding */
    this.currentPods;
    /** @export {number} - Initialized from binding */
    this.desiredPods;
  }

  /**
   * Handles update of replicas count for supported resources.
   * @export
   */
  handleScaleResourceDialog() {
    this.kdScaleService_.showScaleDialog(
        this.objectMeta.namespace, this.objectMeta.name, this.currentPods, this.desiredPods,
        this.resourceKindName, this.resourceKindDisplayName);
  }

  /**
   * @return {boolean}
   * @export
   */
  isMenuItem() {
    return this.menuItem;
  }
}

/**
 * Contains scale button for supported resource detail pages.
 *
 * @type {!angular.Component}
 */
export const scaleButtonComponent = {
  controller: ScaleButtonController,
  templateUrl: 'common/components/scale/scale.html',
  bindings: {
    'resourceKindDisplayName': '@',
    'resourceKindName': '<',
    'objectMeta': '<',
    'currentPods': '<',
    'desiredPods': '<',
    'menuItem': '<',
  },
};
