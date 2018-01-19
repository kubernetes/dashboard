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
import {stateName} from '../detail/state';

/**
 * Controller for the job card.
 *
 * @final
 */
class JobCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Job}
     */
    this.job;

    /** @private {!ui.router.$state} */
    this.state_ = $state;


    /** @private {!../../common/namespace/service.NamespaceService} */
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
  getJobDetailHref() {
    return this.state_.href(
        stateName, new StateParams(this.job.objectMeta.namespace, this.job.objectMeta.name));
  }

  /**
   * Returns true if any of job pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return this.job.pods.warnings.length > 0;
  }

  /**
   * Returns true if job pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return !this.hasWarnings() && this.job.pods.pending > 0;
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
 * @return {!angular.Component}
 */
export const jobCardComponent = {
  bindings: {
    'job': '=',
    'showResourceKind': '<',
  },
  controller: JobCardController,
  templateUrl: 'job/list/card.html',
};
