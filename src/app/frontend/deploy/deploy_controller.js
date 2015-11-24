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

import {stateName as zerostate} from 'zerostate/zerostate_state';
import {stateName as replicasetliststate} from 'replicasetlist/replicasetlist_state';


/**
 * Controller for the deploy view.
 *
 * @final
 */
export default class DeployController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!backendApi.NamespaceList} namespaces
   * @ngInject
   */
  constructor($resource, $log, $state, namespaces) {
    /** @export {string} */
    this.name = '';

    /** @export {string} */
    this.containerImage = '';

    /** @export {number} */
    this.replicas = 1;

    /**
     * List of supported protocols.
     * TODO(bryk): Do not hardcode the here, move to backend.
     * @const @export {!Array<string>}
     */
    this.protocols = ['TCP', 'UDP'];

    /** @export {!Array<!backendApi.PortMapping>} */
    this.portMappings = [this.newEmptyPortMapping_(this.protocols[0])];

    /**
     * List of available namespaces.
     * @export {!Array<string>}
     */
    this.namespaces = namespaces.namespaces;

    /**
     * Currently chosen namespace.
     * @export {(string|undefined)}
     */
    this.namespace = this.namespaces.length > 0 ? this.namespaces[0] : undefined;

    /** @export {boolean} */
    this.isExternal = false;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;
  }

  /**
   * Deploys the application based on the sate of the controller.
   *
   * @export
   */
  deploy() {
    // TODO(bryk): Validate input data before sending to the server.

    /** @type {!backendApi.AppDeployment} */
    let deployAppConfig = {
      containerImage: this.containerImage,
      isExternal: this.isExternal,
      name: this.name,
      portMappings: this.portMappings.filter(this.isPortMappingEmpty_),
      replicas: this.replicas,
      namespace: this.namespace,
    };

    /** @type {!angular.Resource<!backendApi.AppDeployment>} */
    let resource = this.resource_('/api/appdeployments');

    this.isDeployInProgress_ = true;
    resource.save(
        deployAppConfig,
        (savedConfig) => {
          this.isDeployInProgress_ = false;
          this.log_.info('Successfully deployed application: ', savedConfig);
          this.state_.go(replicasetliststate);
        },
        (err) => {
          this.isDeployInProgress_ = false;
          this.log_.error('Error deploying application:', err);
        });
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() { return this.isDeployInProgress_; }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() { this.state_.go(zerostate); }

  /**
   * @param {string} defaultProtocol
   * @return {!backendApi.PortMapping}
   * @private
   */
  newEmptyPortMapping_(defaultProtocol) {
    return {
      port: null,
      targetPort: null,
      protocol: defaultProtocol,
    };
  }

  /**
   * Returns true when the given port mapping hasn't been filled by the user, i.e., is empty.
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingEmpty_(portMapping) { return !!portMapping.port && !!portMapping.targetPort; }
}
