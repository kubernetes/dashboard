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

import {StateParams} from './replicasetdetail_state';
import {getReplicaSetSpecPodsResource} from './replicasetdetail_stateconfig';

/**
 * Controller for the update replica set dialog.
 *
 * @final
 */
export default class UpdateReplicasDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @param {string} namespace
   * @param {string} replicaSet
   * @param {number} currentPods
   * @param {number} desiredPods
   * @ngInject
   */
  constructor(
      $mdDialog, $log, $state, $resource, $q, namespace, replicaSet, currentPods, desiredPods) {
    /** @export {number} */
    this.replicas;

    /** @export {number} */
    this.currentPods = currentPods;

    /** @export {number} */
    this.desiredPods = desiredPods;

    /** @export {string} */
    this.replicaSet = replicaSet;

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

    /** @private {!angular.$q} */
    this.q_ = $q;
  }

  /**
   * Updates number of replicas in replica set.
   *
   * @export
   */
  updateReplicas() {
    let resource = getReplicaSetSpecPodsResource(
        new StateParams(this.namespace_, this.replicaSet), this.resource_);

    /** @type {!backendApi.ReplicaSetSpec} */
    let replicaSetSpec = {
      replicas: this.replicas,
    };

    resource.save(
        replicaSetSpec, this.onUpdateReplicasSuccess_.bind(this),
        this.onUpdateReplicasError_.bind(this));
  }

  /**
   *  Cancels the update replica set dialog.
   *  @export
   */
  cancel() { this.mdDialog_.cancel(); }

  /**
   * @param {!backendApi.ReplicaSetSpec} updatedSpec
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
