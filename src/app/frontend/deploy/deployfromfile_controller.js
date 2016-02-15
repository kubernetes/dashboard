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

import {
  stateName as replicationcontrollerliststate,
} from 'replicationcontrollerlist/replicationcontrollerlist_state';

/**
 * Controller for the deploy from file directive.
 *
 * @final
 */
export default class DeployFromFileController {
  /**
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * TODO (cheld) Set correct type after fixing issue #159
   * @param {!Object} errorDialog
   * @ngInject
   */
  constructor($log, $state, $resource, $q, errorDialog) {
    /**
     * It initializes the scope output parameter
     *
     * @export {!DeployFromFileController}
     */
    this.detail = this;

    /**
     * Custom file model for the selected file
     *
     * @export {{name:string, content:string}}
     */
    this.file = {name: '', content: ''};

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /**
     * TODO (cheld) Set correct type after fixing issue #159
     * @private {!Object}
     */
    this.errorDialog_ = errorDialog;
  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @export
   * @return {!angular.$q.Promise}
   */
  deploy() {
    /** @type {!backendApi.AppDeploymentFromFileSpec} */
    let deploymentSpec = {
      name: this.file.name,
      content: this.file.content,
    };

    let defer = this.q_.defer();

    /** @type {!angular.Resource<!backendApi.AppDeploymentFromFileSpec>} */
    let resource = this.resource_('api/v1/appdeploymentfromfile');
    resource.save(
        deploymentSpec,
        (savedConfig) => {
          defer.resolve(savedConfig);  // Progress ends
          this.log_.info('Successfully deployed application: ', savedConfig);
          this.state_.go(replicationcontrollerliststate);
        },
        (err) => {
          defer.reject(err);  // Progress ends
          this.log_.error('Error deploying application:', err);
          this.errorDialog_.open('Deploying file has failed', err.data);
        });
    return defer.promise;
  }
}
