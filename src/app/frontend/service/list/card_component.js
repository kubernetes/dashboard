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

import {StateParams} from '../../common/resource/resourcedetail';
import {stateName} from '../../service/detail/state';

/**
 * @final
 */
export class ServiceCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /** @private {!../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export {!backendApi.Service} */
    this.service;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
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
