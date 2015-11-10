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
 * Controller for the deploy view.
 *
 * @final
 */
export default class DeployController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @ngInject
   */
  constructor($resource, $log) {
    /** @export {string} */
    this.appName = '';

    /** @export {string} */
    this.containerImage = '';

    /** @private {!angular.Resource<!backendApi.DeployAppConfig>} */
    this.resource_ = $resource('/api/deploy');

    /** @private {!angular.$log} */
    this.log_ = $log;
  }

  /**
   * Deploys the application based on the sate of the controller.
   *
   * @export
   */
  deploy() {
    /** @type {!backendApi.DeployAppConfig} */
    let deployAppConfig = {
      appName: this.appName,
      containerImage: this.containerImage,
    };

    this.resource_.save(
        deployAppConfig,
        (savedConfig) => {
          this.log_.info('Succesfully deployed application: ', savedConfig);
        },
        (err) => {
          this.log_.error('Error deployng application:', err);
        });
  }
}
