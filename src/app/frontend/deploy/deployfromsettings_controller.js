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

import showNamespaceDialog from './createnamespace_dialog';
import showCreateSecretDialog from './createsecret_dialog';
import DeployLabel from './deploylabel';
import {
  stateName as replicationcontrollerliststate,
} from 'replicationcontrollerlist/replicationcontrollerlist_state';
import {uniqueNameValidationKey} from './uniquename_directive';
import DockerImageReference from '../common/docker/dockerimagereference';

// Label keys for predefined labels
const APP_LABEL_KEY = 'app';
const VERSION_LABEL_KEY = 'version';

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
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($log, $state, $resource, $q, $mdDialog) {
    /**
     * It initializes the scope output parameter
     *
     * @export {!DeployFromSettingsController}
     */
    this.detail = this;

    /**
     * Initialized from the scope.
     * @export {!angular.FormController}
     */
    this.form;

    /** @private {boolean} */
    this.showMoreOptions_ = false;

    /** @export {string} */
    this.containerImage = '';

    /** @export {string} */
    this.containerImageErrorMessage = '';

    /** @export {string} */
    this.imagePullSecret = '';

    /** @export {string} */
    this.containerCommand = '';

    /** @export {string} */
    this.containerCommandArgs = '';

    /** @export {number} */
    this.replicas = 1;

    /** @export {string} */
    this.description = '';

    /**
     * Initialized from the scope.
     * @export {!Array<string>}
     */
    this.protocols;

    /**
     * Initialized from the template.
     * @export {!Array<!backendApi.PortMapping>}
     */
    this.portMappings;

    /**
     * Initialized from the template.
     * @export {!Array<!backendApi.EnvironmentVariable>}
     */
    this.variables;

    /** @export {boolean} */
    this.isExternal = false;

    /** @export {!Array<!DeployLabel>} */
    this.labels = [
      new DeployLabel(APP_LABEL_KEY, '', false, this.getName_.bind(this)),
      new DeployLabel(VERSION_LABEL_KEY, '', false, this.getContainerImageVersion_.bind(this)),
      new DeployLabel(),
    ];

    /**
     * List of available namespaces.
     *
     * Initialized from the scope.
     * @export {!Array<string>}
     */
    this.namespaces;

    /**
     * List of available secrets.
     * It is updated every time the user clicks on the imagePullSecret field.
     * @export {!Array<string>}
     */
    this.secrets = [];

    /**
     * @export {string}
     */
    this.name = '';

    /**
     * Checks that a name begins and ends with a lowercase letter
     * and contains nothing but lowercase letters and hyphens ("-")
     * (leading and trailing spaces are ignored by default)
     * @export {!RegExp}
     */
    this.namePattern = new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$');

    /**
     * Maximum length for Application name
     * @export {string}
     */
    this.nameMaxLength = '24';

    /**
     * Whether to run the container as privileged user.
     * @export {boolean}
     */
    this.runAsPrivileged = false;

    /**
     * Currently chosen namespace.
     * @export {string}
     */
    this.namespace = this.namespaces[0];

    /**
     * @export {?number}
     */
    this.cpuRequirement = null;

    /**
     * @type {?number}
     */
    this.memoryRequirement = null;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @return {!angular.$q.Promise}
   * @export
   */
  deploy() {
    // TODO(bryk): Validate input data before sending to the server.
    /** @type {!backendApi.AppDeploymentSpec} */
    let appDeploymentSpec = {
      containerImage: this.containerImage,
      imagePullSecret: this.imagePullSecret ? this.imagePullSecret : null,
      containerCommand: this.containerCommand ? this.containerCommand : null,
      containerCommandArgs: this.containerCommandArgs ? this.containerCommandArgs : null,
      isExternal: this.isExternal,
      name: this.name,
      description: this.description ? this.description : null,
      portMappings: this.portMappings.filter(this.isPortMappingFilled_),
      variables: this.variables.filter(this.isVariableFilled_),
      replicas: this.replicas,
      namespace: this.namespace,
      cpuRequirement: angular.isNumber(this.cpuRequirement) ? this.cpuRequirement : null,
      memoryRequirement: angular.isNumber(this.memoryRequirement) ? `${this.memoryRequirement}Mi` :
                                                                    null,
      labels: this.toBackendApiLabels_(this.labels),
      runAsPrivileged: this.runAsPrivileged,
    };

    let defer = this.q_.defer();

    /** @type {!angular.Resource<!backendApi.AppDeploymentSpec>} */
    let resource = this.resource_('api/v1/appdeployments');
    resource.save(
        appDeploymentSpec,
        (savedConfig) => {
          defer.resolve(savedConfig);  // Progress ends
          this.log_.info('Successfully deployed application: ', savedConfig);
          this.state_.go(replicationcontrollerliststate);
        },
        (err) => {
          defer.reject(err);  // Progress ends
          this.log_.error('Error deploying application:', err);
        });
    return defer.promise;
  }

  /**
   * Displays new namespace creation dialog.
   *
   * @param {!angular.Scope.Event} event
   * @export
   */
  handleNamespaceDialog(event) {
    showNamespaceDialog(this.mdDialog_, event, this.namespaces)
        .then(
            /**
             * Handles namespace dialog result. If namespace was created successfully then it
             * will be selected, otherwise first namespace will be selected.
             *
             * @param {string|undefined} answer
             */
            (answer) => {
              if (answer) {
                this.namespace = answer;
                this.namespaces = this.namespaces.concat(answer);
              } else {
                this.namespace = this.namespaces[0];
              }
            },
            () => { this.namespace = this.namespaces[0]; });
  }

  /**
   * Displays new secret creation dialog.
   *
   * @param {!angular.Scope.Event} event
   * @export
   */
  handleCreateSecretDialog(event) {
    showCreateSecretDialog(this.mdDialog_, event, this.namespace)
        .then(
            /**
             * Handles create secret dialog result. If the secret was created successfully, then it
             * will be selected,
             * otherwise None is selected.
             * @param {string|undefined} response
             */
            (response) => {
              if (response) {
                this.imagePullSecret = response;
                this.secrets = this.secrets.concat(this.imagePullSecret);
              } else {
                this.imagePullSecret = '';
              }
            },
            () => { this.imagePullSecret = ''; });
  }

  /**
   * Queries all secrets for the given namespace.
   * @param {string} namespace
   * @export
   */
  getSecrets(namespace) {
    /** @type {!angular.Resource<!backendApi.SecretsList>} */
    let resource = this.resource_(`api/v1/secrets/${namespace}`);
    resource.get(
        (res) => { this.secrets = res.secrets; },
        (err) => { this.log_.log(`Error getting secrets: ${err}`); });
  }

  /**
   * Resets the currently selected image pull secret.
   * @export
   */
  resetImagePullSecret() { this.imagePullSecret = ''; }

  /**
   * Returns true when name input should show error. This overrides default behavior to show name
   * uniqueness errors even in the middle of typing.
   * @return {boolean}
   * @export
   */
  isNameError() {
    /** @type {!angular.NgModelController} */
    let name = this.form['name'];

    return name.$error[uniqueNameValidationKey] ||
        (name.$invalid && (name.$touched || this.form.$submitted));
  }

  /**
   * Converts array of DeployLabel to array of backend api label
   * @param {!Array<!DeployLabel>} labels
   * @return {!Array<!backendApi.Label>}
   * @private
   */
  toBackendApiLabels_(labels) {
    // Omit labels with empty key/value
    /** @type {!Array<!DeployLabel>} */
    let apiLabels =
        labels.filter((label) => { return label.key.length !== 0 && label.value().length !== 0; });

    // Transform to array of backend api labels
    return apiLabels.map((label) => { return label.toBackendApi(); });
  }

  /**
   * Returns true when the given port mapping is filled by the user, i.e., is not empty.
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingFilled_(portMapping) { return !!portMapping.port && !!portMapping.targetPort; }

  /**
   * Returns true when the given environment variable is filled by the user, i.e., is not empty.
   * @param {!backendApi.EnvironmentVariable} variable
   * @return {boolean}
   * @private
   */
  isVariableFilled_(variable) { return !!variable.name; }

  /**
   * Callbacks used in DeployLabel model to make it aware of controller state changes.
   */

  /**
   * Returns extracted from link container image version.
   * @return {string}
   * @private
   */
  getContainerImageVersion_() { return new DockerImageReference(this.containerImage).tag(); }

  /**
   * Returns application name.
   * @return {string}
   * @private
   */
  getName_() { return this.name; }

  /**
   * Returns true if more options have been enabled and should be shown, false otherwise.
   * @return {boolean}
   * @export
   */
  isMoreOptionsEnabled() { return this.showMoreOptions_; }

  /**
   * Shows or hides more options.
   * @export
   */
  switchMoreOptions() { this.detail.showMoreOptions_ = !this.detail.showMoreOptions_; }
}
