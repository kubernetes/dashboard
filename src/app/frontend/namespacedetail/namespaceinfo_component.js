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
export default class NamespaceInfoController {
  /**
   * Constructs namespace info object.
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($interpolate) {
    /**
     * Namespace details. Initialized from the scope.
     * @export {!backendApi.NamespaceDetail}
     */
    this.namespace;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @export
   * @param  {string} creationDate - creation date of the namespace
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * namespace. */
    let MSG_NAMESPACE_DETAIL_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_NAMESPACE_DETAIL_CREATED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays namespace info.
 *
 * @return {!angular.Directive}
 */
export const namespaceInfoComponent = {
  controller: NamespaceInfoController,
  templateUrl: 'namespacedetail/namespaceinfo.html',
  bindings: {
    /** {!backendApi.NamespaceDetail} */
    'namespace': '=',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a namespace on the namespace details page.*/
  MSG_NAMESPACE_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
  /** @export {string} @desc Label 'Age' for the namespace namespace on the namespace details page.*/
  MSG_NAMESPACE_DETAIL_AGE_LABEL: goog.getMsg('Age'),
  /** @export {string} @desc Label 'Status' for the namespace namespace on the namespace details page.*/
  MSG_NAMESPACE_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
  /** @export {string} @desc Label 'Name' for the namespace name on the namespace details page.*/
  MSG_NAMESPACE_DETAIL_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Label selector' for the namespace's labels list on the namespace
        details page.*/
  MSG_NAMESPACE_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
};
