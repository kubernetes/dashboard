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

export default class DeployFromFilePageObject {
  constructor() {
    this.deployFromFileRadioButtonQuery = by.xpath('//md-radio-button[@value="deployFile"]');
    this.deployFromFileRadioButton = element(this.deployFromFileRadioButtonQuery);

    this.deployButtonQuery = by.css('.kd-deploy-submit-button');
    this.deployButton = element(this.deployButtonQuery);

    this.inputContainerQuery = by.css('.kd-upload-file-container');
    this.inputContainer = element(this.inputContainerQuery);

    this.filePickerQuery = by.css('.kd-upload-file-picker');
    this.filePicker_ = element(this.filePickerQuery);

    this.mdDialogQuery = by.tagName('md-dialog');
    this.mdDialog = element(this.mdDialogQuery);
  }

  /**
   * Make filePicker input field visible
   * Firefox does not allow sendKeys to invisible input[type=file] element
   */
  makeInputVisible() {
    browser.driver.executeScript(function() {
      /* global document */
      let filePickerDomElement = document.getElementsByClassName('kd-upload-file-picker')[0];
      filePickerDomElement.style.visibility = 'visible';
      filePickerDomElement.style.height = '1px';
      filePickerDomElement.style.width = '1px';
    });
  }

  /**
   * Sets filepath on the filePicker input field
   * @param {string} filePath
   */
  setFile(filePath) {
    this.filePicker_.sendKeys(filePath);
  }
}
