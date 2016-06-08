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
import {getReplicationControllerSpecPodsResource} from './replicationcontrollerdetail_stateconfig';

/**
 * Controller for the update replication controller dialog.
 *
 * @final
 */
export default class UpdateReplicasDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {string} namespace
   * @param {string} replicationController
   * @param {number} currentPods
   * @param {number} desiredPods
   * @ngInject
   */
  constructor(
      $mdDialog, $log, $state, $resource, namespace, replicationController, currentPods,
      desiredPods) {
    /** @export {number} */
    this.replicas;

    /** @export {number} */
    this.currentPods = currentPods;

    /** @export {number} */
    this.desiredPods = desiredPods;

    /** @export {string} */
    this.replicationController = replicationController;

    /** @private {string} */
    this.namespace_ = namespace;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export {!angular.FormController} Initialized from the template */
    this.updateReplicasForm;

    /** @export */
    this.i18n = i18n(replicationController, currentPods, desiredPods);
  }

  /**
   * Updates number of replicas in replication controller.
   *
   * @export
   */
  updateReplicas() {
    if (this.updateReplicasForm.$valid) {
      let resource = getReplicationControllerSpecPodsResource(
          new StateParams(this.namespace_, this.replicationController), this.resource_);

      /** @type {!backendApi.ReplicationControllerSpec} */
      let replicationControllerSpec = {
        replicas: this.replicas,
      };

      resource.save(
          replicationControllerSpec, this.onUpdateReplicasSuccess_.bind(this),
          this.onUpdateReplicasError_.bind(this));
    }
  }

  /**
   *  Cancels the update replication controller dialog.
   *  @export
   */
  cancel() { this.mdDialog_.cancel(); }

  /**
   * @param {!backendApi.ReplicationControllerSpec} updatedSpec
   * @private
   */
  onUpdateReplicasSuccess_(updatedSpec) {
    this.log_.info(`Successfully updated replicas number to ${updatedSpec.replicas}`);
    this.mdDialog_.hide();
    this.state_.reload();
  }

  /**
   * @param {!angular.$http.Response} err
   * @private
   */
  onUpdateReplicasError_(err) {
    this.log_.error(err);
    this.mdDialog_.hide();
  }
}

/**
 * @param  {string} replicationController
 * @param  {number} currentPods
 * @param  {number} desiredPods
 * @return {!Object}
 */
function i18n(replicationController, currentPods, desiredPods) {
  return {
    /** @export {string} @desc Title for the pod count update dialog (for a replication controller).*/
    MSG_RC_DETAIL_UPDATE_PODS_COUNT_TITLE: goog.getMsg('Set desired number of pods'),
    /** @export {string} @desc User help for the pod count update dialog (on the replication
        controllers detail page). */
    MSG_RC_DETAIL_UPDATE_PODS_COUNT_USER_HELP: goog.getMsg(
        'Replication controller {$rcName} will be updated to reflect the desired count.',
        {'rcName': replicationController}),
    /** @export {string} @desc Status text for a replication controller, showing the number of
        created and desired pods.*/
    MSG_RC_DETAIL_UPDATE_PODS_COUNT_STATUS_SUBTITLE:
        goog.getMsg('Current status: {$createdPods} created, {$desiredPods} desired', {
          'createdPods': currentPods,
          'desiredPods': desiredPods,
        }),
    /** @export {string} @desc Label 'Number of pods', which appears as a placeholder for the pods
        count input on the "update pods count" dialog (for a replication controller).*/
    MSG_RC_DETAIL_NUMBER_OF_PODS_LABEL: goog.getMsg('Number of pods'),
    /** @export {string} @desc This warning appears when the user does not specify a pods count on
        the "update number of pods" dialog (for a replication controller).*/
    MSG_RC_DETAIL_NUMBER_OF_PODS_REQUIRED_WARNING: goog.getMsg('Number of pods is required'),
    /** @export {string} @desc This warning appears when the specified pods count on
        the "update number of pods" dialog is not positive or non-integer.*/
    MSG_RC_DETAIL_NUMBER_OF_PODS_INTEGER_WARNING: goog.getMsg('Must be a positive integer'),
    /** @export {string} @desc This warning appears when the specified pods count (on the "update
        number of pods" dialog) is very high. */
    MSG_RC_DETAIL_NUMBER_OF_PODS_HIGH_WARNING: goog.getMsg(
        'Setting high number of pods may cause performance issues of the cluster and Dashboard UI.'),
    /** @export {string} @desc Action 'Cancel' for the cancel button on the "update number of pods"
        dialog. */
    MSG_RC_DETAIL_UPDATE_PODS_COUNT_CANCEL_ACTION: goog.getMsg('Cancel'),
    /** @export {string} @desc Action 'OK' for the confirmation button on the "update number of pods
        dialog". */
    MSG_RC_DETAIL_UPDATE_PODS_COUNT_OK_ACTION: goog.getMsg('OK'),
  };
}
