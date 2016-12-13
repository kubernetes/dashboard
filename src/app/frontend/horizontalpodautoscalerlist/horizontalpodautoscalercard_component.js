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
import {stateName as deploymentStateName} from 'deploymentdetail/deploymentdetail_state';
import {stateName} from 'horizontalpodautoscalerdetail/horizontalpodautoscalerdetail_state';
import {stateName as replicaSetStateName} from 'replicasetdetail/replicasetdetail_state';
import {stateName as replicationControllerStateName} from 'replicationcontrollerdetail/replicationcontrollerdetail_state';

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
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /** @export {!backendApi.HorizontalPodAutoscaler} - Initialized from binding. */
    this.horizontalPodAutoscaler;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
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
        stateName, new StateParams(
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

  /**
   * @export
   * @return {string} localized tooltip with the formatted creation date
   */
  getCreatedAtTooltip() {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * the horizontal pod autoscaler.*/
    let MSG_HORIZONTAL_POD_AUTOSCALER_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {
          'creationDate':
              filter({'date': this.horizontalPodAutoscaler.objectMeta.creationTimestamp}),
        });
    return MSG_HORIZONTAL_POD_AUTOSCALER_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @type {!angular.Component}
 */
export const horizontalPodAutoscalerCardComponent = {
  bindings: {'horizontalPodAutoscaler': '=', 'showScaleTarget': '<'},
  controller: HorizontalPodAutoscalerCardController,
  templateUrl: 'horizontalpodautoscalerlist/horizontalpodautoscalercard.html',
};
