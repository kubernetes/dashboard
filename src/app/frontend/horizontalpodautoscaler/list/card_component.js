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
import {stateName as deploymentStateName} from '../../deployment/detail/state';
import {stateName} from '../../horizontalpodautoscaler/detail/state';
import {stateName as replicaSetStateName} from '../../replicaset/detail/state';
import {stateName as replicationControllerStateName} from '../../replicationcontroller/detail/state';

const referenceKindToDetailStateName = {
  Deployment: deploymentStateName,
  ReplicaSet: replicaSetStateName,
  ReplicationController: replicationControllerStateName,
};

/**
 * Controller for horizontal pod autoscaler card.
 *
 * @final
 */
export class HorizontalPodAutoscalerCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /** @export {!backendApi.HorizontalPodAutoscaler} - Initialized from binding. */
    this.horizontalPodAutoscaler;

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
  getHorizontalPodAutoscalerDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(
            this.horizontalPodAutoscaler.objectMeta.namespace,
            this.horizontalPodAutoscaler.objectMeta.name));
  }

  /**
   * @return {string}
   * @export
   */
  getScaleTargetHref() {
    return this.state_.href(
        referenceKindToDetailStateName[this.horizontalPodAutoscaler.scaleTargetRef.kind],
        new StateParams(
            this.horizontalPodAutoscaler.objectMeta.namespace,
            this.horizontalPodAutoscaler.scaleTargetRef.name));
  }
}

/**
 * @type {!angular.Component}
 */
export const horizontalPodAutoscalerCardComponent = {
  bindings: {'horizontalPodAutoscaler': '=', 'showScaleTarget': '<'},
  controller: HorizontalPodAutoscalerCardController,
  templateUrl: 'horizontalpodautoscaler/list/card.html',
};
