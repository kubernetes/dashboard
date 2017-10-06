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
 * Controller for the resource card delete menu item component. It deletes card's resource.
 * @final
 */
export class ResourceCardEditMenuItemController {
  /**
   * @param {!./../../resource/verber_service.VerberService} kdResourceVerberService
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @ngInject
   */
  constructor(kdResourceVerberService, $state, $log) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecard_component.ResourceCardController}
     */
    this.resourceCardCtrl;

    /** @export {string} Initialized from a binding.*/
    this.resourceKindName;

    /** @private {!./../../resource/verber_service.VerberService} */
    this.kdResourceVerberService_ = kdResourceVerberService;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;
  }

  /**
   * @export
   */
  edit() {
    this.kdResourceVerberService_
        .showEditDialog(
            this.resourceKindName, this.resourceCardCtrl.typeMeta, this.resourceCardCtrl.objectMeta)
        .then(() => {
          // For now just reload the state. Later we can update the item in place.
          this.state_.reload();
        })
        .catch((err) => {
          if (err) {
            this.log_.error('Error showing edit dialog:', err);
          }
        });
  }
}

/**
 * @type {!angular.Component}
 */
export const resourceCardEditMenuItemComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardeditmenuitem.html',
  bindings: {
    'resourceKindName': '@',
  },
  bindToController: true,
  require: {
    'resourceCardCtrl': '^kdResourceCard',
  },
  controller: ResourceCardEditMenuItemController,
};
