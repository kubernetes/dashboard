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
 * Controller for the action bar delete item component. It adds option to delete item from
 * details page action bar.
 *
 * @final
 */
export class ActionbarDeleteItemController {
  /**
   * @param {!./../../resource/verber_service.VerberService} kdResourceVerberService
   * @param {!./../breadcrumbs/breadcrumbs_service.BreadcrumbsService} kdBreadcrumbsService
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor(kdResourceVerberService, kdBreadcrumbsService, $state) {
    /** @export {string} Initialized from a binding. */
    this.resourceKindName;

    /** @export {!backendApi.TypeMeta} Initialized from a binding. */
    this.typeMeta;

    /** @export {!backendApi.ObjectMeta} Initialized from a binding. */
    this.objectMeta;

    /** @export {boolean} Initialized from a binding. */
    this.buttonClasses;

    /** @private {!./../../resource/verber_service.VerberService} */
    this.kdResourceVerberService_ = kdResourceVerberService;

    /** @private {!./../breadcrumbs/breadcrumbs_service.BreadcrumbsService} */
    this.kdBreadcrumbsService_ = kdBreadcrumbsService;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;
  }

  /**
   * @export
   */
  remove() {
    this.kdResourceVerberService_
        .showDeleteDialog(this.resourceKindName, this.typeMeta, this.objectMeta)
        .then((data) => {
          // Do not execute if cancel was clicked
          if (data) {
            let parentStateName =
                this.kdBreadcrumbsService_.getParentStateName(this.state_['$current']);
            this.state_.go(parentStateName);
          }
        });
  }
}

/**
 * Action bar delete item component should be used only on resource details page in order to
 * add button that allows deletion of this resource.
 *
 * @type {!angular.Component}
 */
export const actionbarDeleteItemComponent = {
  templateUrl: 'common/components/actionbar/actionbardeleteitem.html',
  bindings: {
    'resourceKindName': '@',
    'typeMeta': '<',
    'objectMeta': '<',
    'buttonClasses': '@',
  },
  bindToController: true,
  replace: true,
  controller: ActionbarDeleteItemController,
};
