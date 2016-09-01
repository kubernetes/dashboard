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
export class PersistentVolumeClaimCardListController {
  /**
   * @ngInject
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   */
  constructor(kdNamespaceService) {
    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;
  }
  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * @return {!angular.Component}
 */
export const persistentVolumeClaimCardListComponent = {
  transclude: true,
  bindings: {
    'persistentVolumeClaimList': '<',
    'persistentVolumeClaimListResource': '<',
  },
  templateUrl: 'persistentvolumeclaimlist/persistentvolumeclaimcardlist.html',
  controller: PersistentVolumeClaimCardListController,
};

const i18n = {
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
     persistent volume claims (persistent volume claim list view). */
  MSG_PERSISTENT_VOLUME_CLAIM_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' which appears as a column label in the table of
   persistent volume claims (persistent volume claim list view). */
  MSG_PERSISTENT_VOLUME_CLAIM_LIST_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Volume' which appears as a column label in the table of
   persistent volume claims (persistent volume claim list view). */
  MSG_PERSISTENT_VOLUME_CLAIM_LIST_VOLUME_LABEL: goog.getMsg('Volume'),
  /** @export {string} @desc Label 'Labels' which appears as a column label in the table of
     persistent volume claim (persistent volume claim list view). */
  MSG_PERSISTENT_VOLUME_CLAIM_LIST_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Age' which appears as a column label in the
     table of persistent volume claims (persistent volume claim list view). */
  MSG_PERSISTENT_VOLUME_CLAIM_LIST_AGE_LABEL: goog.getMsg('Age'),
};
