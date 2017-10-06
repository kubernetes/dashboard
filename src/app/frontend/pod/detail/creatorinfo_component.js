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
import {stateName as daemonSetStateName} from '../../daemonset/detail/state';
import {stateName as deploymentStateName} from '../../deployment/detail/state';
import {stateName as jobStateName} from '../../job/detail/state';
import {stateName as replicaSetStateName} from '../../replicaset/detail/state';
import {stateName as replicationControllerStateName} from '../../replicationcontroller/detail/state';
import {stateName as statefulSetStateName} from '../../statefulset/detail/state';

const creatorKindToDetailStateName = {
  'deployment': deploymentStateName,
  'replicaset': replicaSetStateName,
  'replicationcontroller': replicationControllerStateName,
  'daemonset': daemonSetStateName,
  'statefulset': statefulSetStateName,
  'job': jobStateName,
};

/**
 * @final
 */
export default class CreatorInfoController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /** @export {!backendApi.Controller} Initialized from a binding. */
    this.creator;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * Returns true if any of creator pods has warning, false otherwise.
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return this.creator.pods.warnings.length > 0;
  }

  /**
   * Returns true if creator pods have no warnings and there is at least one pod in pending state,
   * false otherwise.
   * @return {boolean}
   * @export
   */
  isPending() {
    return !this.hasWarnings() && this.creator.pods.pending > 0;
  }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return !this.isPending() && !this.hasWarnings();
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
  getCreatorDetailHref() {
    return this.state_.href(
        creatorKindToDetailStateName[this.creator.typeMeta.kind],
        new StateParams(this.creator.objectMeta.namespace, this.creator.objectMeta.name));
  }
}

/**
 * @type {!angular.Component}
 */
export const creatorInfoComponent = {
  controller: CreatorInfoController,
  templateUrl: 'pod/detail/creatorinfo.html',
  bindings: {
    'creator': '<',
  },
};
