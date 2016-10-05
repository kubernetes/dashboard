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
 * A component that displays common resource detail properties from object meta.
 * @final
 */
export class InfoCardController {
  /**
   * @ngInject
   */
  constructor() {
    /** @export {!backendApi.ObjectMeta} */
    this.objectMeta;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * @type {!angular.Component}
 */
export const infoCardComponent = {
  templateUrl: 'common/components/resourcedetail/infocard.html',
  bindings: {
    'objectMeta': '<',
  },
  controller: InfoCardController,
};

const i18n = {
  /** @export {string} @desc Label 'Name' for a resource. */
  MSG_RESOURCE_DETAIL_INFO_CARD_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' for a resource. */
  MSG_RESOURCE_DETAIL_INFO_CARD_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Creation time' for a resource. */
  MSG_RESOURCE_DETAIL_INFO_CARD_START_TIME_LABEL: goog.getMsg('Creation time'),
  /** @export {string} @desc Label 'Labels' for a resource.*/
  MSG_RESOURCE_DETAIL_INFO_CARD_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'annotations' for a resource.*/
  MSG_RESOURCE_DETAIL_INFO_CARD_ANNOTATIONS_LABEL: goog.getMsg('Annotations'),
};
