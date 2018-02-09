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
import {stateName} from '../../networkpolicy/detail/state';

/**
 * Controller for the networkpolicy controller card.
 *
 * @final
 */
export default class NetworkPolicyCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.NetworkPolicy}
     */
    this.networkPolicy;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

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
  getNetworkPolicyDetailHref() {
    return this.state_.href(
      stateName,
      new StateParams(
          this.networkPolicy.objectMeta.namespace, this.networkPolicy.objectMeta.name));
  }

  /**
   * Returns true if any of the networkpolicy controller's pods have warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return false;
  }

  /**
   * Returns true if the networkpolicy controller's pods have no warnings and there is at least one
   * pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return false;
  }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return !this.isPending() && !this.hasWarnings();
  }

  /**
   * @export
   * @param  {string} creationDate - creation date of the pod
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /**
     * @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * replication controller.
     */
    let MSG_NETWORKPOLICY_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_NETWORKPOLICY_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const networkPolicyCardComponent = {
  bindings: {
    'networkPolicy': '=',
  },
  controller: NetworkPolicyCardController,
  templateUrl: 'networkpolicy/list/card.html',
};
