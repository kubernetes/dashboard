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

import {stateName as replicasetliststate} from 'replicasetlist/replicasetlist_state';

/**
 * Controller for the deploy from settings directive.
 *
 * @final
 */
export default class DeployFromSettingsController {
  /**
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @ngInject
   */
  constructor($log, $state, $resource, $q) {
    /**
     * It initializes the scope output parameter
     *
     * @export {!DeployFromSettingsController}
     */
    this.detail = this;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export {string} */
    this.containerImage = '';

    /** @export {number} */
    this.replicas = 1;

    /** @export {string} */
    this.description = '';

    /**
     * List of supported protocols.
     * TODO(bryk): Do not hardcode the here, move to backend.
     * @const @export {!Array<string>}
     */
    this.protocols = ['TCP', 'UDP'];

    /** @export {!Array<!backendApi.PortMapping>} */
    this.portMappings = [this.newEmptyPortMapping_(this.protocols[0])];

    /** @export {boolean} */
    this.isExternal = false;
  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @export
   * @return {angular.$q.Promise}
   */
  deploy() {
    // TODO(bryk): Validate input data before sending to the server.
    /** @type {!backendApi.AppDeploymentSpec} */
    let appDeploymentSpec = {
      containerImage: this.containerImage,
      isExternal: this.isExternal,
      name: this.name,
      description: this.description,
      portMappings: this.portMappings.filter(this.isPortMappingEmpty_),
      replicas: this.replicas,
      namespace: this.namespace,
    };

    let defer = this.q_.defer();

    /** @type {!angular.Resource<!backendApi.AppDeploymentSpec>} */
    let resource = this.resource_('/api/appdeployments');
    resource.save(
        appDeploymentSpec,
        (savedConfig) => {
          defer.resolve(savedConfig);  // Progress ends
          this.log_.info('Successfully deployed application: ', savedConfig);
          this.state_.go(replicasetliststate);
        },
        (err) => {
          defer.reject(err);  // Progress ends
          this.log_.error('Error deploying application:', err);
        });
    return defer.promise;
  }

  /**
   * @param {string} defaultProtocol
   * @return {!backendApi.PortMapping}
   * @private
   */
  newEmptyPortMapping_(defaultProtocol) {
    return {port: null, targetPort: null, protocol: defaultProtocol};
  }

  /**
   * Returns true when the given port mapping hasn't been filled by the user, i.e., is empty.
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingEmpty_(portMapping) { return !!portMapping.port && !!portMapping.targetPort; }
}
