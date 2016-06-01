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

import DeployLabel from './deploylabel';

/**
 * Service used for handling label actions like: hover, showing duplicated key error, etc.
 * @final
 */
export default class DeployLabelController {
  /**
   * Constructs our label controller.
   */
  constructor() {
    /** @export {!DeployLabel} Initialized from the scope. */
    this.label;

    /** @export {!Array<!DeployLabel>} Initialized from the scope. */
    this.labels;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Calls checks on label:
   *  - adds label if last empty label has been filled
   *  - checks for duplicated key and sets validity of element
   * @param {!angular.FormController|undefined} labelForm
   * @export
   */
  check(labelForm) {
    this.addIfNeeded_();
    this.validateKey_(labelForm);
  }

  /**
   * Returns true when label is editable and is not last on the list.
   * Used to indicate whether delete icon should be shown near label.
   * @return {boolean}
   * @export
   */
  isRemovable() {
    /** @type {!DeployLabel} */
    let lastElement = this.labels[this.labels.length - 1];
    return !!(this.label.editable && this.label !== lastElement);
  }

  /**
   * Deletes row from labels list.
   * @export
   */
  deleteLabel() {
    /** @type {number} */
    let rowIdx = this.labels.indexOf(this.label);

    if (rowIdx > -1) {
      this.labels.splice(rowIdx, 1);
    }
  }

  /**
   * Adds label if last label key and value has been filled.
   * @private
   */
  addIfNeeded_() {
    /** @type {!DeployLabel} */
    let lastLabel = this.labels[this.labels.length - 1];
    if (this.isFilled_(lastLabel)) {
      this.addNewLabel_();
    }
  }

  /**
   * Adds row to labels list.
   * @private
   */
  addNewLabel_() { this.labels.push(new DeployLabel()); }

  /**
   * Validates label within label form.
   * Current checks:
   *  - duplicated key
   * @param {!angular.FormController|undefined} labelForm
   * @private
   */
  validateKey_(labelForm) {
    if (angular.isDefined(labelForm)) {
      /** @type {!angular.NgModelController} */
      let elem = labelForm['key'];

      /** @type {boolean} */
      let isUnique = !this.isKeyDuplicated_();

      elem.$setValidity('unique', isUnique);
    }
  }

  /**
   * Returns true if there are 2 or more labels with the same key on the labelList,
   * false otherwise.
   * @return {boolean}
   * @private
   */
  isKeyDuplicated_() {
    /** @type {number} */
    let duplications = 0;

    this.labels.forEach((label) => {
      if (this.label.key.length !== 0 && label.key === this.label.key) {
        duplications++;
      }
    });

    return duplications > 1;
  }

  /**
   * Returns true if label key and value are not empty, false otherwise.
   * @param {!DeployLabel} label
   * @return {boolean}
   * @private
   */
  isFilled_(label) { return label.key.length !== 0 && label.value().length !== 0; }

  /**
   * @export
   * @return {string}
   */
  getLabelKeyUniqueWarning() {
    /** @type {string} @desc This warning appears when the key of a specified kubernetes label on
     * the deploy page is not unique.*/
    let MSG_DEPLOY_LABEL_KEY_NOT_UNIQUE_WARNING =
        goog.getMsg('{$labelKey} is not unique.', {'labelKey': this.label.key});
    return MSG_DEPLOY_LABEL_KEY_NOT_UNIQUE_WARNING;
  }
}

const i18n = {
  /** @export {string} @desc This warning appears when the key of a specified kubernetes label
     (on the deploy page) does not start with a proper prefix. */
  MSG_DEPLOY_LABEL_KEY_PREFIX_PATTERN_WARNING:
      goog.getMsg('Prefix is not a valid DNS subdomain prefix. Example: my-domain.com'),
  /** @export {string} @desc This warning appears when the key name of a specified kubernetes
     label (on the deploy page) does not match the required pattern.*/
  MSG_DEPLOY_LABEL_KEY_NAME_PATTERN_WARNING:
      goog.getMsg(`Label key name must be alphanumeric separated by '-', '_' or '.', ` +
                  `optionally prefixed by a DNS subdomain and '/'`),
  /** @export {string} @desc This warning appears when the key prefix of a specified kubernetes
     label (on the deploy page) is too long.*/
  MSG_DEPLOY_LABEL_KEY_PREFIX_MAX_LENGTH_WARNING:
      goog.getMsg('Prefix should not exceed 253 characters'),
  /** @export {string} @desc This warning appears when the key name of a specified kubernetes
     label (on the deploy page) is too long.*/
  MSG_DEPLOY_LABEL_KEY_NAME_MAX_LENGTH_WARNING:
      goog.getMsg('Label Key name should not exceed 63 characters'),
  /** @export {string} @desc This warning appears when the value of a specified kubernetes label
     (on the deploy page) does not match the required pattern.*/
  MSG_DEPLOY_LABEL_VALUE_PATTERN_WARNING:
      goog.getMsg(`Label value must be alphanumeric separated by '.' , '-' or '_'`),
  /** @export {string} @desc This warning appears when the value of a specified kubernetes label
     (on the deploy page) is too long.*/
  MSG_DEPLOY_LABEL_VALUE_MAX_LENGTH_WARNING:
      goog.getMsg('Label Value must not exceed 253 characters'),

};
