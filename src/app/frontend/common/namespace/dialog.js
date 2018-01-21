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

import {namespaceParam} from '../../chrome/state';
import {stateName as overview} from '../../overview/state';

/** @final */
export class NamespaceChangeInfoDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {string} currentNamespace
   * @param {string} newNamespace
   * @param {!./../state/service.FutureStateService} kdFutureStateService
   * @param {!kdUiRouter.$state} $state
   * @ngInject
   */
  constructor($mdDialog, currentNamespace, newNamespace, kdFutureStateService, $state) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!./../state/service.FutureStateService}} */
    this.futureStateService_ = kdFutureStateService;

    /** @private {!kdUiRouter.$state} */
    this.state_ = $state;

    /** @export {string} */
    this.currentNamespace = currentNamespace;

    /** @export {string} */
    this.newNamespace = newNamespace;
  }

  /**
   * Cancels namespace change and redirects to last state.
   *
   * @export
   */
  cancel() {
    this.mdDialog_.cancel();
    this.state_.go(this.futureStateService_.state, {[namespaceParam]: this.currentNamespace});
  }

  /** @export */
  changeNamespace() {
    this.mdDialog_.hide();
    this.state_.go(overview, {[namespaceParam]: this.newNamespace});
  }
}

/**
 * Displays new namespace change info dialog.
 *
 * @param {!md.$dialog} mdDialog
 * @param {string} currentNamespace
 * @param {string} newNamespace
 * @return {!angular.$q.Promise}
 */
export function showNamespaceChangeInfoDialog(mdDialog, currentNamespace, newNamespace) {
  return mdDialog.show({
    controller: NamespaceChangeInfoDialogController,
    controllerAs: '$ctrl',
    clickOutsideToClose: false,
    templateUrl: 'common/namespace/dialog.html',
    locals: {
      'currentNamespace': currentNamespace,
      'newNamespace': newNamespace,
    },
  });
}
