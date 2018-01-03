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

import showScaleDialog from './dialog';

/**
 * Opens scale resource dialog.
 *
 * @final
 */
export class ScaleService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Opens an scale resource dialog. Returns a promise that is resolved/rejected when
   * user wants
   * to update the replicas. Nothing happens when user clicks cancel on the dialog.
   *
   * @param {string} namespace
   * @param {string} resource
   * @param {number} currentPods
   * @param {number} desiredPods
   * @param {string} resourceKindName
   * @returns {!angular.$q.Promise}
   */
  showScaleDialog(
      namespace, resource, currentPods, desiredPods, resourceKindName, resourceKindDisplayName) {
    return showScaleDialog(
        this.mdDialog_, namespace, resource, currentPods, desiredPods, resourceKindName,
        resourceKindDisplayName);
  }
}
