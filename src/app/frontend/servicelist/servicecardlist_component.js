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

import {StateParams} from 'common/resource/resourcedetail';
import {stateName} from 'servicedetail/servicedetail_state';

/**
 * @final
 */
export class ServiceCardListController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /** @type {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export {boolean} */
    this.isMultipleNamespaces = this.kdNamespaceService_.getMultipleNamespacesSelected();

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @param {!backendApi.Service} service
   * @return {string}
   * @export
   */
  getServiceDetailHref(service) {
    return this.state_.href(
        stateName, new StateParams(service.objectMeta.namespace, service.objectMeta.name));
  }

  /**
   * Returns true if Service has no assigned Cluster IP
   * or if Service type is LoadBalancer or NodePort and doesn't have an external endpoint IP
   * @param {!backendApi.Service} service
   * @return {boolean}
   * @export
   */
  isPending(service) {
    return service.clusterIP === null ||
        ((service.type === 'LoadBalancer') && service.externalEndpoints === null);
  }

  /**
   * Returns true if Service has ClusterIP assigned and one of the following conditions is met:
   *  - Service type is LoadBalancer or NodePort and has an external endpoint IP
   *  - Service type is not LoadBalancer or NodePort
   * @param {!backendApi.Service} service
   * @return {boolean}
   * @export
   */
  isSuccess(service) { return !this.isPending(service); }

  /**
   * Returns the service's clusterIP or a dash ('-') if it is not yet set
   * @param {!backendApi.Service} service
   * @return {string}
   * @export
   */
  getServiceClusterIP(service) { return service.clusterIP ? service.clusterIP : '-'; }
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
  /** @export {string} @desc Label 'Namespace' which appears as a column label in the
     table of services (service list view). */
  MSG_SERVICE_LIST_NAMESPACE_LABEL: goog.getMsg('Namespace'),
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
  /** @export {string} @desc tooltip for pending service card icon */
  MSG_SERVICE_IS_PENDING_TOOLTIP: goog.getMsg('This service is in a pending state.'),
};
