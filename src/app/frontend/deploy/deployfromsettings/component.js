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

import {stateName as overview} from '../../overview/state';

import showNamespaceDialog from './createnamespace/dialog';
import showCreateSecretDialog from './createsecret/dialog';
import DeployLabel from './deploylabel/deploylabel';
import {uniqueNameValidationKey} from './uniquename_directive';

// Label keys for predefined labels
const APP_LABEL_KEY = 'k8s-app';

/** @final */
class DeployFromSettingsController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!md.$dialog} $mdDialog
   * @param {!../../chrome/state.StateParams} $stateParams
   * @param {!../../common/history/service.HistoryService} kdHistoryService
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @param {!../service.DeployService} kdDeployService
   * @ngInject
   */
  constructor(
      $log, $resource, $mdDialog, $stateParams, kdHistoryService, kdNamespaceService,
      kdDeployService) {
    /** @export {!angular.FormController} */
    this.form;

    /** @private {!../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

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

    /** @export {!Array<!backendApi.PortMapping>} */
    this.portMappings = [];

    /** @export {!Array<!backendApi.EnvironmentVariable>} */
    this.variables = [];

    /** @export {boolean} */
    this.isExternal = false;

    /** @export {!Array<!DeployLabel>} */
    this.labels = [
      new DeployLabel(APP_LABEL_KEY, '', false, this.getName_.bind(this)),
      new DeployLabel(),
    ];

    /**
     * List of available secrets. It is updated every time the user clicks on the imagePullSecret
     * field.
     * @export {!Array<string>}
     */
    this.secrets = [];

    /** @export {string} */
    this.name = '';

    /**
     * Checks that a name begins and ends with a lowercase letter
     * and contains nothing but lowercase letters and hyphens ("-")
     * (leading and trailing spaces are ignored by default)
     * @export {!RegExp}
     */
    this.namePattern = new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$');

    /** @export {string} */
    this.nameMaxLength = '24';

    /** @export {boolean} */
    this.runAsPrivileged = false;

    /** @export {?number} */
    this.cpuRequirement = null;

    /** @type {?number} */
    this.memoryRequirement = null;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!../../chrome/state.StateParams} */
    this.stateParams_ = $stateParams;

    /** @private {!../../common/history/service.HistoryService} */
    this.historyService_ = kdHistoryService;

    /** @export {!Array<string>} */
    this.protocols;

    /** @export {!Array<string>} */
    this.namespaces;

    /** @export {string} */
    this.namespace = this.stateParams_.namespace || '';

    /** @private {!../service.DeployService} */
    this.deployService_ = kdDeployService;
  }

  /** @export */
  $onInit() {
    let namespacesResource = this.resource_('api/v1/namespace');
    namespacesResource.get(
        (namespaces) => {
          this.namespaces = namespaces.namespaces.map((n) => n.objectMeta.name);
          this.namespace = !this.kdNamespaceService_.areMultipleNamespacesSelected() ?
              this.stateParams_.namespace || this.namespaces[0] :
              this.namespaces[0];
        },
        (err) => {
          this.log_.log(`Error during getting namespaces: ${err}`);
        });

    let protocolsResource = this.resource_('api/v1/appdeployment/protocols');
    protocolsResource.get(
        (protocols) => {
          this.protocols = protocols.protocols;
        },
        (err) => {
          this.log_.log(`Error during getting protocols: ${err}`);
        });
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() {
    return !this.form.$valid || this.deployService_.isDeployDisabled();
  }

  /**
   * @export
   */
  cancel() {
    this.historyService_.back(overview);
  }

  /**
   * @export
   */
  deploy() {
    /** @type {!backendApi.AppDeploymentSpec} */
    let spec = {
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

    this.deployService_.deploy(spec);
  }

  /**
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
            () => {
              this.namespace = this.namespaces[0];
            });
  }

  /**
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
            () => {
              this.imagePullSecret = '';
            });
  }

  /**
   * @param {string} namespace
   * @export
   */
  getSecrets(namespace) {
    /** @type {!angular.Resource} */
    let resource = this.resource_(`api/v1/secret/${namespace}`);
    resource.get(
        (res) => {
          this.secrets = res.secrets.map((e) => e.objectMeta.name);
        },
        (err) => {
          this.log_.log(`Error getting secrets: ${err}`);
        });
  }

  /**
   * @export
   */
  resetImagePullSecret() {
    this.imagePullSecret = '';
  }

  /**
   * Returns true when name input should show error. This overrides default behavior to show name
   * uniqueness errors even in the middle of typing.
   *
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
   * Converts array of DeployLabel to array of backend api label.
   *
   * @param {!Array<!DeployLabel>} labels
   * @return {!Array<!backendApi.Label>}
   * @private
   */
  toBackendApiLabels_(labels) {
    // Omit labels with empty key/value
    /** @type {!Array<!DeployLabel>} */
    let apiLabels = labels.filter((label) => {
      return label.key.length !== 0 && label.value().length !== 0;
    });

    // Transform to array of backend api labels
    return apiLabels.map((label) => {
      return label.toBackendApi();
    });
  }

  /**
   * Returns true when the given port mapping is filled by the user, i.e., is not empty.
   *
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingFilled_(portMapping) {
    return !!portMapping.port && !!portMapping.targetPort;
  }

  /**
   * @param {!backendApi.EnvironmentVariable} variable
   * @return {boolean}
   * @private
   */
  isVariableFilled_(variable) {
    return !!variable.name;
  }

  /**
   * @return {string}
   * @private
   */
  getName_() {
    return this.name;
  }

  /**
   * Returns true if more options have been enabled and should be shown, false otherwise.
   *
   * @return {boolean}
   * @export
   */
  isMoreOptionsEnabled() {
    return this.showMoreOptions_;
  }

  /**
   * Shows or hides more options.
   * @export
   */
  switchMoreOptions() {
    this.showMoreOptions_ = !this.showMoreOptions_;
  }
}

/**
 * @return {!angular.Component}
 */
export const deployFromSettingsComponent = {
  controller: DeployFromSettingsController,
  templateUrl: 'deploy/deployfromsettings/deployfromsettings.html',
};
