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
import {stateName} from 'service/detail/state';

/**
 * @final
 */
export class ServiceCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export {!backendApi.Service} */
    this.service;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @return {string}
   * @export
   */
  getServiceDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.service.objectMeta.namespace, this.service.objectMeta.name));
  }

  /**
   * Returns true if Service has no assigned Cluster IP
   * or if Service type is LoadBalancer or NodePort and doesn't have an external endpoint IP
   * @return {boolean}
   * @export
   */
  isPending() {
    return this.service.clusterIP === null ||
        ((this.service.type === 'LoadBalancer') && this.service.externalEndpoints === null);
  }

  /**
   * Returns true if Service has ClusterIP assigned and one of the following conditions is met:
   *  - Service type is LoadBalancer or NodePort and has an external endpoint IP
   *  - Service type is not LoadBalancer or NodePort
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return !this.isPending();
  }

  /**
   * Returns the service's clusterIP or a dash ('-') if it is not yet set
   * @return {string}
   * @export
   */
  getServiceClusterIP() {
    return this.service.clusterIP ? this.service.clusterIP : '-';
  }

  /**
   * @export
   * @param  {string} startDate - start date of the service
   * @return {string} localized tooltip with the formatted start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the service.*/
    let MSG_SERVICE_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Created at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_SERVICE_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays service card.
 *
 * @type {!angular.Component}
 */
export const serviceCardComponent = {
  templateUrl: 'service/list/card.html',
  controller: ServiceCardController,
  bindings: {
    /** {!backendApi.Service} */
    'service': '<',
  },
};
