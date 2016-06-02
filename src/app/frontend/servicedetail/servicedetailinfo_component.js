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
 * Service info controller.
 * @final
 */
class ServiceInfoController {
  constructor() {
    /** @export */
    this.i18n = i18n;
  }
}

/**
 * Definition object for the component that displays service info.
 *
 * @return {!angular.Directive}
 */
export const serviceInfoComponent = {
  templateUrl: 'servicedetail/servicedetailinfo.html',
  bindings: {
    /** {!backendApi.ServiceDetail} */
    'service': '<',
  },
  controller: ServiceInfoController,
};

const i18n = {
  /** @export {string} @desc Title 'Resource details' at the top service details view. */
  MSG_SERVICE_DETAIL_RESOURCE_DETAILS_TITLE: goog.getMsg('Resource Details'),
  /** @export {string} @desc Subtitle 'Details' at the top of the resource details column at the service detail view. */
  MSG_SERVICE_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
  /** @export {string} @desc Label 'Name' for the service name in details part (left) of the service details view. */
  MSG_SERVICE_DETAIL_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' for the service namespace in the details part (left) of the service details view. */
  MSG_SERVICE_DETAIL_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Label selector' for the service's label selector in the details part (left) of the service details view. */
  MSG_SERVICE_DETAIL_LABEL_SELECTOR_LABEL: goog.getMsg('Label selector'),
  /** @export {string} @desc Label 'Labels' for the service labels in the details part (left) of the service details view. */
  MSG_SERVICE_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Type' for the service type in the details part (left) of the service details view. */
  MSG_SERVICE_DETAIL_TYPE_LABEL: goog.getMsg('Type'),
  /** @export {string} @desc Subtitle 'Connection' at the top of the column about network connectivity (right) at the service detail view.*/
  MSG_SERVICE_DETAIL_CONNECTION_SUBTITLE: goog.getMsg('Connection'),
  /** @export {string} @desc Label 'Cluster IP' for the service IP in the cluster, appears in the connectivity part (right) of the service details view.*/
  MSG_SERVICE_DETAIL_CLUSTER_IP_LABEL: goog.getMsg('Cluster IP'),
  /** @export {string} @desc Label 'Internal endpoints' for the internal endpoints of the service, appears in the connectivity part (right) of the service details view.*/
  MSG_SERVICE_DETAIL_INTERNAL_ENDPOINTS_LABEL: goog.getMsg('Internal endpoints'),
  /** @export {string} @desc Label 'External endpoints' for the external endpoints of the service, appears in the connectivity part (right) of the service details view. */
  MSG_SERVICE_DETAIL_EXTERNAL_ENDPOINTS_LABEL: goog.getMsg('External endpoints'),

};
