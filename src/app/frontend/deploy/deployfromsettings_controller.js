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

import {stateName as workloads} from 'workloads/workloads_state';

import DockerImageReference from '../common/docker/dockerimagereference';

import showNamespaceDialog from './createnamespace_dialog';
import showCreateSecretDialog from './createsecret_dialog';
import DeployLabel from './deploylabel';
import {uniqueNameValidationKey} from './uniquename_directive';


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
   * @param {!backendApi.NamespaceList} namespaces
   * @param {!backendApi.Protocols} protocols
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @param {!md.$dialog} $mdDialog
   * @param {!./../chrome/chrome_state.StateParams} $stateParams
   * @param {!./../common/history/history_service.HistoryService} kdHistoryService
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @param {!./../common/csrftoken/csrftoken_service.CsrfTokenService} kdCsrfTokenService
   * @ngInject
   */
  constructor(
      namespaces, protocols, $log, $state, $resource, $q, $mdDialog, $stateParams, kdHistoryService,
      kdNamespaceService, kdCsrfTokenService) {
    /**
     * Initialized from the template.
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
     * @export {!Array<string>}
     */
    this.protocols = protocols.protocols;

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
     * @export {!Array<string>}
     */
    this.namespaces = namespaces.namespaces.map((n) => n.objectMeta.name);

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
    this.namespace = !kdNamespaceService.areMultipleNamespacesSelected() ?
        $stateParams.namespace || this.namespaces[0] :
        this.namespaces[0];

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

    /** @private {!./../common/history/history_service.HistoryService} */
    this.kdHistoryService_ = kdHistoryService;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;

    /** @private {!angular.$q.Promise} */
    this.tokenPromise = kdCsrfTokenService.getTokenForAction('appdeployment');

    /**
     * @export
     */
    this.i18n = i18n;
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() {
    return this.isDeployInProgress_;
  }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() {
    this.kdHistoryService_.back(workloads);
  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @export
   */
  deploy() {
    if (this.form.$valid) {
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
        memoryRequirement:
            angular.isNumber(this.memoryRequirement) ? `${this.memoryRequirement}Mi` : null,
        labels: this.toBackendApiLabels_(this.labels),
        runAsPrivileged: this.runAsPrivileged,
      };

      let defer = this.q_.defer();

      this.tokenPromise.then(
          (token) => {
            /** @type {!angular.Resource<!backendApi.AppDeploymentSpec>} */
            let resource = this.resource_(
                'api/v1/appdeployment', {},
                {save: {method: 'POST', headers: {'X-CSRF-TOKEN': token}}});
            this.isDeployInProgress_ = true;
            resource.save(
                appDeploymentSpec,
                (savedConfig) => {
                  defer.resolve(savedConfig);  // Progress ends
                  this.log_.info('Successfully deployed application: ', savedConfig);
                  this.state_.go(workloads);
                },
                (err) => {
                  defer.reject(err);  // Progress ends
                  this.log_.error('Error deploying application:', err);
                });
          },
          (err) => {
            defer.reject(err);
            this.log_.error('Error deploying application:', err);
          });
      defer.promise.finally(() => {
        this.isDeployInProgress_ = false;
      });
    }
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
            () => {
              this.namespace = this.namespaces[0];
            });
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
            () => {
              this.imagePullSecret = '';
            });
  }

  /**
   * Queries all secrets for the given namespace.
   * @param {string} namespace
   * @export
   */
  getSecrets(namespace) {
    /** @type {!angular.Resource<!backendApi.SecretsList>} */
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
   * Resets the currently selected image pull secret.
   * @export
   */
  resetImagePullSecret() {
    this.imagePullSecret = '';
  }

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
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingFilled_(portMapping) {
    return !!portMapping.port && !!portMapping.targetPort;
  }

  /**
   * Returns true when the given environment variable is filled by the user, i.e., is not empty.
   * @param {!backendApi.EnvironmentVariable} variable
   * @return {boolean}
   * @private
   */
  isVariableFilled_(variable) {
    return !!variable.name;
  }

  /**
   * Callbacks used in DeployLabel model to make it aware of controller state changes.
   */

  /**
   * Returns extracted from link container image version.
   * @return {string}
   * @private
   */
  getContainerImageVersion_() {
    return new DockerImageReference(this.containerImage).tag();
  }

  /**
   * Returns application name.
   * @return {string}
   * @private
   */
  getName_() {
    return this.name;
  }

  /**
   * Returns true if more options have been enabled and should be shown, false otherwise.
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

const i18n = {

  /** @export {string} @desc Appears when the typed in app name on the deploy from settings page
     exceeds the maximal allowed length. */
  MSG_DEPLOY_SETTINGS_APP_NAME_MAX_LENGTH_WARNING:
      goog.getMsg(`Name must be up to {$maxLength} characters long.`, {
        'maxLength': '24',
      }),

  /** @export {string} @desc User help for the `App name` input on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_APP_NAME_USER_HELP: goog.getMsg(
      `An 'app' label with this value will be added to the Deployment and Service that get deployed.`),

  /** @export {string} @desc The text is used as a 'Learn more' link text on the deploy from
     settings page. */
  MSG_DEPLOY_SETTINGS_LEARN_MORE_ACTION: goog.getMsg('Learn more'),

  /** @export {string} @desc Label "Container image", which appears as a placeholder in an empty
     input field for a container image on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_CONTAINER_IMAGE_LABEL: goog.getMsg(`Container image`),

  /** @export {string} @desc Appears to tell the user that the container image input on the deploy
     from settings page is required.*/
  MSG_DEPLOY_SETTINGS_CONTAINER_IMAGE_REQUIRED_WARNING: goog.getMsg(`Container image is required`),

  /** @export {string} @desc Appears to tell the user that the typed in container image is invalid.
     This text must end with a colon. */
  MSG_DEPLOY_SETTINGS_CONTAINER_IMAGE_INVALID_WARNING: goog.getMsg(`Container image is invalid:`),

  /** @export {string} @desc User help for the container image input on the deploy from settings
     page.*/
  MSG_DEPLOY_SETTINGS_CONTAINER_IMAGE_USER_HELP: goog.getMsg(
      `Enter the URL of a public image on any registry, or a private image hosted on Docker Hub or Google Container Registry.`),

  /** @export {string} @desc Label "Number of pods", which appears as a placeholder in an empty
     input field for the number of pods on the deploy from settings page.*/
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_LABEL: goog.getMsg(`Number of pods`),

  /** @export {string} @desc Appears to tell the user that the "number of pods" input on the deploy
     from settings page is required. */
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_REQUIRED_WARNING: goog.getMsg(`Number of pods is required`),

  /** @export {string} @desc Appears to tell the user that the number of pods on the deploy from
     settings page must be non-negative or integer. */
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_INT_WARNING:
      goog.getMsg(`Number of pods must be a positive integer`),

  /** @export {string} @desc Appears to tell the user that the number of pods on the deploy from
     settings page must be at least 1. */
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_MIN_WARNING: goog.getMsg(`Number of pods must be at least 1`),

  /** @export {string} @desc Appears as a warning when the user has specified a really high number
     of pods on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_HIGH_WARNING: goog.getMsg(
      `Setting high number of pods may cause performance issues of the cluster and Dashboard UI.`),

  /** @export {string} @desc User help for the "number of pods" input on the deploy from settings
     page. */
  MSG_DEPLOY_SETTINGS_NUMBER_OF_PODS_USER_HELP: goog.getMsg(
      `A Deployment will be created to maintain the desired number of pods across your cluster.`),

  /** @export {string} @desc User help for the "port mappings" input on the deploy from settings
     page. */
  MSG_DEPLOY_SETTINGS_PORT_MAPPINGS_USER_HELP: goog.getMsg(
      `Optionally, an internal or external Service can be defined to map an incoming Port to a target Port seen by the container.`),

  /** @export {string} @desc User help, tells the user what the DNS name of his deployed service (on
     the deploy page) is going to be. The actual name will follow, so this text must end with a
     colon. */
  MSG_DEPLOY_SETTINGS_SERVICE_DNS_NAME_USER_HELP:
      goog.getMsg(`The internal DNS name for this Service will be:`),

  /** @export {string} @desc Label "Description", which appears as a placeholder in the empty
     description input on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_DESCRIPTION_LABEL: goog.getMsg(`Description`),

  /** @export {string} @desc User help for the "Description" input on the deploy from settings
     page.*/
  MSG_DEPLOY_SETTINGS_DESCRIPTION_USER_HELP: goog.getMsg(
      `The description will be added as an annotation to the Replication Controller and displayed in the application's details.`),

  /** @export {string} @desc Title of the labels input section on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_LABELS_TITLE: goog.getMsg(`Labels`),

  /** @export {string} @desc Label "Key" for the key input fields, in the labels section on the
     deploy from settings page. */
  MSG_DEPLOY_SETTINGS_LABELS_KEY_LABEL: goog.getMsg(`Key`),

  /** @export {string} @desc Label "Value" for the value input fields, in the labels section on the
     deploy from settings page. */
  MSG_DEPLOY_SETTINGS_LABELS_VALUE_LABEL: goog.getMsg(`Value`),

  /** @export {string} @desc User help for the "Labels" section on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_LABELS_USER_HELP: goog.getMsg(
      `The specified labels will be applied to the created Replication Controller, Service (if any) and Pods. Common labels include release, environment, tier, partition and track.`),

  /** @export {string} @desc Label "Namespace" label, for the namespace selection box on the deploy
     from settings page. */
  MSG_DEPLOY_SETTINGS_NAMESPACE_LABEL: goog.getMsg(`Namespace`),

  /** @export {string} @desc The text appears in the namespace selection box on the deploy from
     settings page, and acts as a button. Clicking it creates a new namespace. */
  MSG_DEPLOY_SETTINGS_NAMESPACE_CREATE_ACTION: goog.getMsg(`Create a new namespace...`),

  /** @export {string} @desc User help for the namespace selection on the deploy from settings page.
     */
  MSG_DEPLOY_SETTINGS_NAMESPACE_USER_HELP:
      goog.getMsg(`Namespaces let you partition resources into logically named groups.`),

  /** @export {string} @desc Label "Image Pull Secret", which appears as a placeholder in the image
     pull secret selection box on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_IMAGE_PULL_SECRET_LABEL: goog.getMsg(`Image Pull Secret`),

  /** @export {string} @desc The text appears in the image pull secret selection box on the deploy
     from settings page and acts as a button. Pressing it creates a new image pull secret.*/
  MSG_DEPLOY_SETTINGS_IMAGE_PULL_SECRET_CREATE_ACTION: goog.getMsg(`Create a new secret...`),

  /** @export {string} @desc User help for the "Image Pull Secret" selection box on the deploy from
     settings page. */
  MSG_DEPLOY_SETTINGS_IMAGE_PULL_SECRET_USER_HELP: goog.getMsg(
      `The specified image could require a pull secret credential if it is private. You may choose an existing secret or create a new one.`),

  /** @export {string} @desc Label "CPU requirement", which appears as a placeholder for the cpu
     input on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_CPU_REQUIREMENT_LABEL: goog.getMsg(`CPU requirement (cores)`),

  /** @export {string} @desc Appears to tell the user that the typed in CPU cores count on the
     deploy page is not a number. */
  MSG_DEPLOY_SETTINGS_CPU_NOT_A_NUMBER_WARNING:
      goog.getMsg(`CPU requirement must be given as a valid number.`),

  /** @export {string} @desc Appears to tell the user that the typed in number of CPU cores (on the
     deploy page) cannot be negative. */
  MSG_DEPLOY_SETTINGS_CPU_NEGATIVE_WARNING:
      goog.getMsg(`CPU requirement must be given as a positive number.`),

  /** @export {string} @desc Label "Memory requirement", which appears as a placeholder for the
     memory input on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_MEMORY_REQUIREMENT_LABEL: goog.getMsg(`Memory requirement (MiB)`),

  /** @export {string} @desc Appears to tell the user that the typed in memory on the deploy page is
     not a number. */
  MSG_DEPLOY_SETTINGS_MEMORY_NOT_A_NUMBER_WARNING:
      goog.getMsg(`Memory requirement must be given as a valid number.`),

  /** @export {string} @desc Appears to tell the user that the typed in memory (on the deploy page)
     cannot be negative. */
  MSG_DEPLOY_SETTINGS_MEMORY_NEGATIVE_WARNING:
      goog.getMsg(`Memory requirement must be given as a positive number.`),

  /** @export {string} @desc User help for the memory and cpu requirement inputs on the deploy from
     settings page.*/
  MSG_DEPLOY_SETTINGS_CPU_MEM_USER_HELP:
      goog.getMsg(`You can specify minimum CPU and memory requirements for the container.`),

  /** @export {string} @desc Label "Run command" (a noun, not a verb), which serves as a placeholder
     for the 'Command' input on the deploy from settings page.*/
  MSG_DEPLOY_SETTINGS_RUN_COMMAND_LABEL: goog.getMsg(`Run command`),

  /** @export {string} @desc Label "Run command arguments", which serves as a placeholder for the
     command arguments input on the deploy from settings page. */
  MSG_DEPLOY_SETTINGS_RUN_COMMAND_ARGUMENTS_LABEL: goog.getMsg(`Run command arguments`),

  /** @export {string} @desc User help for the "Run command" input on the deploy from settings
     page.*/
  MSG_DEPLOY_SETTINGS_RUN_COMMAND_USER_HELP: goog.getMsg(
      `By default, your containers run the selected image's default entrypoint command. You can use the command options to override the default.`),

  /** @export {string} @desc Label "Run as privileged" for the corresponding checkbox on the deploy
     from settings page. */
  MSG_DEPLOY_SETTINGS_RUN_AS_PRIVILEGED_LABEL: goog.getMsg(`Run as privileged`),

  /** @export {string} @desc User help for the "Run as privileged" checkbox input on the deploy from
     settings page. */
  MSG_DEPLOY_SETTINGS_RUN_PRIVILEGED_USER_HELP: goog.getMsg(
      `Processes in privileged containers are equivalent to processes running as root on the host.`),

  /** @export {string} @desc User help for the "Environment variables" section on the deploy from
     settings page. */
  MSG_DEPLOY_SETTINGS_ENV_VARIABLES_USER_HELP: goog.getMsg(
      `Environment variables available for use in the container. Values can reference other variables using $(VAR_NAME) syntax.`),

  /** @export {string} @desc The text is put on the 'Deploy' button at the end of the deploy
   * page. */
  MSG_DEPLOY_APP_DEPLOY_ACTION: goog.getMsg('Deploy'),

  /** @export {string} @desc The text is put on the 'Cancel' button at the end of the deploy
   * page. */
  MSG_DEPLOY_APP_CANCEL_ACTION: goog.getMsg('Cancel'),

  /** @export {string} @desc Action "Show advanced options" for the toggle button on the deploy page. */
  MSG_DEPLOY_SHOW_ADVANCED_ACTION: goog.getMsg('show advanced options'),

  /** @export {string} @desc Action "Hide advanced options" for the toggle button on the deploy page. */
  MSG_DEPLOY_HIDE_ADVANCED_ACTION: goog.getMsg('hide advanced options'),
};
