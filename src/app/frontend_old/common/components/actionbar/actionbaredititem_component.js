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
export class ActionbarEditItemController {
  /**
   * @param {!./../../resource/verber_service.VerberService} kdResourceVerberService
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor(kdResourceVerberService, $state) {
    /** @export {string} Initialized from a binding. */
    this.resourceKindName;

    /** @export {!backendApi.TypeMeta} Initialized from a binding. */
    this.typeMeta;

    /** @export {!backendApi.ObjectMeta} Initialized from a binding. */
    this.objectMeta;

    /** @private {!./../../resource/verber_service.VerberService} */
    this.kdResourceVerberService_ = kdResourceVerberService;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;
  }

  /**
   * @export
   */
  edit() {
    this.kdResourceVerberService_
        .showEditDialog(this.resourceKindName, this.typeMeta, this.objectMeta)
        .then(() => {
          this.state_.reload();
        });
  }

  /**
   * @export
   * @return {string}
   */
  getEditTooltip() {
    /**
     * @type {string} @desc Generic "Edit some resource" tooltip text which appears over the
     * edit icon on the global action bar.
     */
    let MSG_ACTION_BAR_EDIT_TOOLTIP =
        goog.getMsg('Edit {$resourceName}', {'resourceName': this.resourceKindName});
    return MSG_ACTION_BAR_EDIT_TOOLTIP;
  }
}

/**
 * Action bar edit item component is to be used on resource details page in order to
 * add button that allows for edit.
 *
 * @type {!angular.Component}
 */
export const actionbarEditItemComponent = {
  templateUrl: 'common/components/actionbar/actionbaredititem.html',
  bindings: {
    'resourceKindName': '@',
    'typeMeta': '<',
    'objectMeta': '<',
  },
  controller: ActionbarEditItemController,
};
