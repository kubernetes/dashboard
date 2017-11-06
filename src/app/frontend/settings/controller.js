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

const CONCURRENT_CHANGE_ERROR = 'settings changed since last reload'

/**
 * Controller for the settings view.
 *
 * @final
 */
export class SettingsController {
  /**
   * @param {!angular.$q} $q
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!backendApi.Settings} globalSettings
   * @param {!./../common/csrftoken/service.CsrfTokenService} kdCsrfTokenService
   * @param {string} kdCsrfTokenHeader
   * @ngInject
   */
  constructor(
      $q, $resource, $log, $mdDialog, globalSettings, kdCsrfTokenService, kdCsrfTokenHeader) {
    /** @export {!angular.FormController} */
    this.globalForm;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    this.mdDialog_ = $mdDialog;

    /** @export {!backendApi.Settings} */
    this.global = globalSettings;

    /** @private {!angular.$q.Promise} */
    this.tokenPromise = kdCsrfTokenService.getTokenForAction('settingsmanagement');

    /** @private {string} */
    this.csrfHeaderName_ = kdCsrfTokenHeader;

    /** @export {Array<number>} */
    this.itemsPerPageAllowedValues = [10, 25, 50];

    this.saveAnywaysDialog = this.mdDialog_.confirm()
                                 .title('Settings have changed since last reload')
                                 .textContent('Do you want to save them anyways?')
                                 .ok('Force save')
                                 .cancel('Refresh');
  }

  /**
   * @param {boolean} force
   * @export
   */
  saveGlobal(force) {
    /** @type {!backendApi.Settings} */
    let settings = {
      clusterName: this.global.clusterName,
      itemsPerPage: this.global.itemsPerPage,
    };

    /** @type {!angular.Resource} */
    let resource = this.resource_(
        'api/v1/settings/global', {},
        {update: {method: 'PUT', headers: {'Content-Type': 'application/json'}}});

    resource.update(
        settings,
        (savedSettings) => {
          this.log_.info('Successfully saved settings: ', savedSettings);
          this.globalForm.$setPristine();
        },
        (err) => {
          this.log_.error('Error during saving settings:', err);
          if (!force && err && err.data.indexOf(CONCURRENT_CHANGE_ERROR) !== -1) {
            this.mdDialog_.show(this.saveAnywaysDialog)
                .then(
                    () => {
                      this.log_.info('Trying to deploy again with force');
                      this.saveGlobal(true);
                      // TODO
                    },
                    () => {
                      this.log_.info('Reloading settings');
                      // TODO
                    });
          }
        });
  }
}
