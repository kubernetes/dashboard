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

/** @final */
class DeployFromFileController {
  /**
   * @param {!../../common/history/service.HistoryService} kdHistoryService
   * @param {!../service.DeployService} kdDeployService
   * @param {!../../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor(kdHistoryService, kdDeployService, kdNamespaceService) {
    /** @export {!angular.FormController} */
    this.form;

    /** @private {!../../common/history/service.HistoryService} */
    this.historyService_ = kdHistoryService;

    /** @private {!../../common/namespace/service.NamespaceService} */
    this.namespaceService_ = kdNamespaceService;

    /** @private {!../service.DeployService} */
    this.deployService_ = kdDeployService;

    /** @export {!kdFile} */
    this.file = {name: '', content: ''};
  }

  /**
   * @export
   * @return {boolean}
   */
  isDeployDisabled() {
    return this.form.$valid === false || this.deployService_.isDeployDisabled();
  }

  /**
   * @param {!kdFile} file
   * @export
   */
  onFileLoad(file) {
    this.file = file;
  }

  /**
   * @export
   */
  deploy() {
    this.deployService_.deployContent(this.file.content, true, this.file.name);
  }

  /**
   * @export
   */
  cancel() {
    this.historyService_.back(overview);
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}

/** @return {!angular.Component} */
export const deployFromFileComponent = {
  controller: DeployFromFileController,
  templateUrl: 'deploy/deployfromfile/deployfromfile.html',
};
