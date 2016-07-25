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
export class ServiceCardListController {
  /** @ngInject */
  constructor() {
    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays service card list.
 *
 * @type {!angular.Component}
 */
export const serviceCardListComponent = {
  templateUrl: 'servicelist/servicecardlist.html',
  controller: ServiceCardListController,
  bindings: {
    /** {!backendApi.ServiceList} */
    'serviceList': '<',
    /** {angular.Resource} */
    'serviceListResource': '<',
    /** {boolean} */
    'selectable': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
     services (service list view). */
  MSG_SERVICE_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Labels' which appears as a column label in the table of
     services (service list view). */
  MSG_SERVICE_LIST_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Cluster IP' which appears as a column label in the table of
     services (service list view). */
  MSG_SERVICE_LIST_CLUSTER_IP_LABEL: goog.getMsg('Cluster IP'),
  /** @export {string} @desc Label 'Internal endpoints' which appears as a column label in the
     table of services (service list view). */
  MSG_SERVICE_LIST_INTERNAL_ENDPOINTS_LABEL: goog.getMsg('Internal endpoints'),
  /** @export {string} @desc Label 'External endpoints' which appears as a column label in the
     table of services (service list view). */
  MSG_SERVICE_LIST_EXTERNAL_ENDPOINTS_LABEL: goog.getMsg('External endpoints'),
};
