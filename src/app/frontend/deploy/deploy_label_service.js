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


import DeployFormLabel, {APP_LABEL_KEY, VERSION_LABEL_KEY} from './deploy_form_label';

/**
 * Service used for handling label actions like: hover, showing duplicated key error, etc.
 * @final DeployLabelService
 */
export default class DeployLabelService {

  /**
   * Checks label and either adds/deletes row to/from list if there is no error.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {!DeployFormLabel} label
   */
  checkLabel(labelList, label) {
    /** @type {!DeployFormLabel} */
    let lastLabel = labelList[labelList.length - 1];

    if (label.key === '' && label.value === '' && label !== lastLabel) {
      this.deleteLabel(labelList, label);
    }

    if (lastLabel.key !== '' && lastLabel.value !== '') {
      this.addLabel(labelList);
    }
  }

  /**
   * Adds row to labels list.
   * @param {!Array<!DeployFormLabel>} labelList
   */
  addLabel(labelList) {
    labelList.push(new DeployFormLabel());
  }

  /**
   * Deletes row from labels list.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {!DeployFormLabel} label
   */
  deleteLabel(labelList, label) {
    /** @type {number} */
    let rowIdx = labelList.findIndex(function(elem) {
      return label === elem;
    });

    if(rowIdx > -1) {
      labelList.splice(rowIdx, 1);
    }
  }

  /**
   * Binds name param to non-editable app label in order to
   * autocomplete 'app' value label when name value is filled.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {string} name
   */
  bindNameLabel(labelList, name) {
    labelList.filter(function (label) {
      return label.key === APP_LABEL_KEY;
    })[0].value = name;
  }

  /**
   * Binds containerImage param to non-editable version label in order to
   * autocomplete 'version' label value when container image value is filled.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {string} containerImage
   */
  bindVersionLabel(labelList, containerImage) {
    /** @type {number} */
    let index = containerImage.lastIndexOf(':');

    /** @type {string} */
    let version = '';

    if (index > -1) {
      version = containerImage.substring(index + 1);
    }

    labelList.filter(function (label) {
      return label.key === VERSION_LABEL_KEY;
    })[0].value = version;
  }

  /**
   * Returns true when label is editable and is not last on the list.
   * Used to indicate whether delete icon should be shown near label.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {!DeployFormLabel} label
   * @returns {boolean}
   */
  isRemovable(labelList, label) {
    /** @type {!DeployFormLabel} */
    let lastElement = labelList[labelList.length - 1];
    return !!(label.editable && label !== lastElement && label.hovered);
  }

  /**
   * Shows delete icon after label definition when mouse enters the list item.
   * @param {!DeployFormLabel} label
   */
  onEnter(label) {
    label.hovered = true;
  }

  /**
   * Hides delete icon after label definition when mouse leaves the list item.
   * @param {!DeployFormLabel} label
   */
  onLeave(label) {
    label.hovered = false;
  }

  /**
   * Returns true if there are 2 or more labels with the same key on the labelList,
   * false otherwise.
   * @param {!Array<!DeployFormLabel>} labelList
   * @param {!DeployFormLabel} label
   * @returns {boolean}
   */
  isDuplicated(labelList, label) {
    /** @type {number} */
    let duplications = 0;
    for (let i = 0; i < labelList.length; i++) {
      if (label.key.length !== 0 && labelList[i].key === label.key) {
        duplications++;
      }
    }

    return duplications > 1;
  }

  /**
   * Returns true if there is at least 1 label with 'hasError' property set to true.
   * @param {!Array<!DeployFormLabel>} labelList
   * @returns {boolean}
   */
  hasDuplicationError(labelList) {
    return labelList.some(label => label.hasError);
  }
}
