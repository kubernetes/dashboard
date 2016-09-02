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
export default class IngressInfoController {
  constructor() {
    /** @export {!backendApi.IngressDetail} Initialized from the scope. */
    this.ingress;

    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays ingress info.
 *
 * @return {!angular.Directive}
 */
export const ingressInfoComponent = {
  controller: IngressInfoController,
  templateUrl: 'ingressdetail/info.html',
  bindings: {
    /** {!backendApi.IngressDetail} */
    'ingress': '=',
  },
};

const i18n = {
  /** @export {string} @desc Resource info details section name. */
  MSG_INGRESS_INFO_DETAILS_SECTION: goog.getMsg('Details'),
  /** @export {string} @desc Resource info status section name. */
  MSG_INGRESS_INFO_STATUS_SECTION: goog.getMsg('Status'),
  /** @export {string} @desc Resource info details section name entry. */
  MSG_INGRESS_INFO_NAME_ENTRY: goog.getMsg('Name'),
  /** @export {string} @desc Resource info details section namespace entry. */
  MSG_INGRESS_INFO_NAMESPACE_ENTRY: goog.getMsg('Namespace'),
  /** @export {string} @desc Resource info details section labels entry. */
  MSG_INGRESS_INFO_LABELS_ENTRY: goog.getMsg('Labels'),
  /** @export {string} @desc Resource info details section annotations entry. */
  MSG_INGRESS_INFO_ANNOTATIONS_ENTRY: goog.getMsg('Annotations'),
};
