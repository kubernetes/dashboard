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
import {stateName} from '../../statefulset/detail/state';

/**
 * Controller for the stateful set card.
 *
 * @final
 */
export default class StatefulSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.StatefulSet}
     */
    this.statefulSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

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
  getStatefulSetDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.statefulSet.objectMeta.namespace, this.statefulSet.objectMeta.name));
  }

  /**
   * Returns true if any of stateful set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return this.statefulSet.pods.warnings.length > 0;
  }

  /**
   * Returns true if stateful set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return !this.hasWarnings() && this.statefulSet.pods.pending > 0;
  }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return !this.isPending() && !this.hasWarnings();
  }
}

/**
 * @type {!angular.Component}
 */
export const statefulSetCardComponent = {
  bindings: {
    'statefulSet': '=',
    'showResourceKind': '<',
  },
  controller: StatefulSetCardController,
  templateUrl: 'statefulset/list/card.html',
};
