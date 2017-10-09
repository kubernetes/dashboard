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

/**
 * Controller for the update replication controller dialog.
 *
 * @final
 */
export default class ScaleResourceDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {string} namespace
   * @param {string} resourceName
   * @param {number} currentPods
   * @param {number} desiredPods
   * @param {string} resourceKindName
   * @param {string} resourceKindDisplayName
   * @ngInject
   */
  constructor(
      $mdDialog, $log, $state, $resource, namespace, currentPods, desiredPods, resourceName,
      resourceKindName, resourceKindDisplayName) {
    /** @export {number} */
    this.currentPods = currentPods;

    /** @export {number} */
    this.desiredPods = desiredPods;

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

    /** @export {string} */
    this.resourceKindName = resourceKindName;

    /** @export {string} */
    this.resourceKindDisplayName = resourceKindDisplayName;

    /** @export {string} */
    this.resourceName = resourceName;
  }

  /**
   * @export
   * @return {string}
   */
  getCurrentPods() {
    /**
     * @type {string} @desc Satisfies a way to make normal binding in angularjs to pass in google closure compiler.
     */
    let MSG_CURRENT_PODS_MSG =
        goog.getMsg('Current status: {$currentPods} created', {'currentPods': this.currentPods});

    return MSG_CURRENT_PODS_MSG;
  }

  /**
   * @export
   * @return {string}
   */
  getDesiredPods() {
    /**
     * @type {string} @desc Satisfies a way to make normal binding in angularjs to pass in google closure compiler.
     */
    let MSG_DESIRED_PODS_MSG =
        goog.getMsg(' {$desiredPods} desired.', {'desiredPods': this.desiredPods});

    return MSG_DESIRED_PODS_MSG;
  }

  /**
   * Updates number of replicas for a resource that is scalable.
   *
   * @export
   */
  scaleResource() {
    return this.getResource()
        .update(this.onUpdateReplicasSuccess_.bind(this), this.onUpdateReplicasError_.bind(this))
        .$promise;
  }

  getResource() {
    return this.resource_(
        `api/v1/scale/${this.resourceKindName}/${this.namespace_}/${this.resourceName}/`,
        {'scaleBy': this.desiredPods}, {
          update: {
            // redefine update action defaults
            method: 'PUT',
            transformRequest: function(headers) {
              headers = angular.extend({}, headers, {'Content-Type': 'application/json'});
              return angular.toJson(headers);
            },
          },
        });
  }

  /**
   * Check if the resource is of type job.
   * @export
   */
  isJob() {
    return this.resourceKindName.toLowerCase() === 'job';
  }

  /**
   * Create a string with the resource url for the given resource
   * @param {!backendApi.TypeMeta} typeMeta
   * @param {!backendApi.ObjectMeta} objectMeta
   * @return {string}
   */
  getRawResourceUrl(typeMeta, objectMeta) {
    let resourceUrl = `api/v1/_raw/${typeMeta.kind}`;
    if (objectMeta.namespace !== undefined) {
      resourceUrl += `/namespace/${objectMeta.namespace}`;
    }
    resourceUrl += `/name/${objectMeta.name}`;
    return resourceUrl;
  }


  /**
   *  Cancels the update for resource scaling dialog.
   *  @export
   */
  cancel() {
    this.mdDialog_.cancel();
  }

  /**
   * @param {!backendApi.ReplicaCounts} updatedSpec
   * @private
   */
  onUpdateReplicasSuccess_(updatedSpec) {
    this.log_.info(`Successfully updated replicas number to ${updatedSpec.desiredReplicas}`);
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
