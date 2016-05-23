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

/**
 * Secret creation dialog controller.
 *
 * @final
 */
export default class CreateSecretController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * TODO (cheld) Set correct type after fixing issue #159
   * @param {!Object} errorDialog
   * @param {string} namespace
   * @ngInject
   */
  constructor($mdDialog, $log, $resource, errorDialog, namespace) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /**
     * TODO (cheld) Set correct type after fixing issue #159
     * @private {!Object}
     */
    this.errorDialog_ = errorDialog;

    /** @export {!angular.FormController} */
    this.secretForm;

    /**
     * The current selected namespace, initialized from the scope.
     * @export {string}
     */
    this.namespace = namespace;

    /** @export {string} */
    this.secretName;

    /**
     * The Base64 encoded data for the ImagePullSecret.
     * @export {string}
     */
    this.data;

    /**
     * Max-length validation rule for secretName.
     * @export {number}
     */
    this.secretNameMaxLength = 253;

    /**
     * Pattern validation rule for secretName.
     * @export {!RegExp}
     */
    this.secretNamePattern =
        new RegExp('^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$');

    /**
     * Pattern validating if the secret's data is Base64 encoded.
     * @export {!RegExp}
     */
    this.dataPattern =
        new RegExp('^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$');

    /**
     * @export
     * {!Object<string, string>}
     */
    this.i18n = i18n;
  }

  /**
   * Cancels the create secret form.
   * @export
   */
  cancel() { this.mdDialog_.cancel(); }

  /**
   * Creates new secret based on the state of the controller.
   * @export
   */
  createSecret() {
    if (!this.secretForm.$valid) return;

    /** @type {!backendApi.SecretSpec} */
    let secretSpec = {
      name: this.secretName,
      namespace: this.namespace,
      data: this.data,
    };
    /** @type {!angular.Resource<!backendApi.SecretSpec>} */
    let resource = this.resource_(`api/v1/secret/`);

    resource.save(
        secretSpec,
        (savedConfig) => {
          this.log_.info('Successfully created secret:', savedConfig);
          this.mdDialog_.hide(this.secretName);
        },
        (err) => {
          this.mdDialog_.hide();
          this.errorDialog_.open('Error creating secret', err.data);
          this.log_.info('Error creating secret:', err);
        });
  }
}

const i18n = {
  /** @export {string} @desc Create image pull secret dialog title. The message appears at the top of the dialog box. */
  MSG_IMAGE_PULL_SECRET_CREATE_DIALOG_TITLE: goog.getMsg('Create a new image pull secret'),

  /** @export {string} @desc Create image pull secret dialog subtitle. Appears right below the title. */
  MSG_IMAGE_PULL_SECRET_CREATE_DIALOG_SUBTITLE:
      goog.getMsg('The new secret will be added to the cluster'),

  /** @export {string} @desc Label 'Secret name', which appears as a placeholder in an empty input field in the image pull secret creation dialog. */
  MSG_IMAGE_PULL_SECRET_NAME_LABEL: goog.getMsg('Secret name'),

  /** @export {string} @desc The text appears when the image pull secret name does not match the expected pattern. */
  MSG_IMAGE_PULL_SECRET_NAME_PATTERN_WARNING:
      goog.getMsg('Name must follow the DNS domain name syntax (e.g. new.image-pull.secret)'),

  /** @export {string} @desc The text appears when the image pull secret name exceeds the maximal length. */
  MSG_IMAGE_PULL_SECRET_NAME_LENGTH_WARNING:
      goog.getMsg('Name must be up to {$maxLength} characters long.', {'maxLength': 253}),

  /** @export @type string  @desc Warning which tells the user that the image pull secret name is required. */
  MSG_IMAGE_PULL_SECRET_NAME_REQUIRED_WARNING: goog.getMsg('Name is required.'),

  /** @export {string} @desc  User help text for the create image pull secret dialog. Directly after this text a specific namespace is specified. */
  MSG_IMAGE_PULL_SECRET_CREATE_DIALOG_USER_HELP:
      goog.getMsg('A secret with the specified name will be added to the cluster in the namespace'),

  /** @export {string} @desc Label 'Image pull secret data', which appears as a placeholder in an empty input field in the image pull secret creation dialog. */
  MSG_IMAGE_PULL_SECRET_DATA_LABEL: goog.getMsg('Image pull secret data'),

  /** @export {string} @desc Warning which tells the user that the image pull secret data is required. */
  MSG_IMAGE_PULL_SECRET_DATA_REQUIRED_WARNING: goog.getMsg('Data is required'),

  /** @export {string} @desc The text appears when the image pull secret data is not Base64 encoded. */
  MSG_IMAGE_PULL_SECRET_DATA_BASE64_WARNING: goog.getMsg('Data must be Base64 encoded'),

  /** @export {string} @desc User help text for the input of the "Image Pull Secret" data. */
  MSG_IMAGE_PULL_SECRET_DATA_USER_HELP: goog.getMsg(
      `Specify the data for your secret to hold. The value is the Base64 encoded content of a .dockercfg file.`),

  /** @export {string} @desc The text is put on the 'Create' button in the image pull secret creation dialog. */
  MSG_IMAGE_PULL_SECRET_CREATE_ACTION: goog.getMsg('Create'),

  /** @export {string} @desc The text is put on the 'Cancel' button in the image pull secret creation dialog. */
  MSG_IMAGE_PULL_SECRET_CANCEL_ACTION: goog.getMsg('Cancel'),

  /** @export {string} @desc The text is used as a 'Learn more' link text in the image pull secret creation dialog */
  MSG_IMAGE_PULL_SECRET_LEARN_MORE_ACTION: goog.getMsg('Learn more'),
};
