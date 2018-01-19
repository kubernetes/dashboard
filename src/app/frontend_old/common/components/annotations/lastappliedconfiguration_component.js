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

export class Controller {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @export {string} Initialized from a binding */
    this.value;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /** @export */
  openDetails() {
    let dialog = this.mdDialog_.alert()
                     .title(`kubectl.kubernetes.io/last-applied-configuration`)
                     .textContent(this.value)
                     .ok(i18n.MSG_CONFIG_DIALOG_CLOSE_ACTION);
    this.mdDialog_.show(dialog);
  }
}

const i18n = {
  /** @export {string} @desc Action "Close" on a dialog. */
  MSG_CONFIG_DIALOG_CLOSE_ACTION: goog.getMsg('Close'),
};

/**
 * @return {!angular.Component}
 */
export const lastAppliedConfigurationComponent = {
  controller: Controller,
  templateUrl: 'common/components/annotations/lastappliedconfiguration.html',
  bindings: {
    /** type {string} */
    'value': '<',
  },
};
