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
 * Controller for the action bar delete item component. It adds option to delete item from
 * details page action bar.
 *
 * @final
 */
export class ActionbarDeleteItemController {
  /**
   * @param {!./../../resource/verber_service.VerberService} kdResourceVerberService
   * @param {!./../breadcrumbs/service.BreadcrumbsService} kdBreadcrumbsService
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

    /** @private {!./../../resource/verber_service.VerberService} */
    this.kdResourceVerberService_ = kdResourceVerberService;

    /** @private {!./../breadcrumbs/service.BreadcrumbsService} */
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
        .then(() => {
          let parentStateName =
              this.kdBreadcrumbsService_.getParentStateName(this.state_['$current']);
          this.state_.go(parentStateName);
        });
  }

  /**
   * @export
   * @return {string}
   */
  getDeleteTooltip() {
    /**
     * @type {string} @desc Generic "Delete some resource" tooltip text which appears over the
     * delete icon on the global action bar.
     */
    let MSG_ACTION_BAR_DELETE_TOOLTIP =
        goog.getMsg('Delete {$resourceName}', {'resourceName': this.resourceKindName});
    return MSG_ACTION_BAR_DELETE_TOOLTIP;
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
  },
  controller: ActionbarDeleteItemController,
};
