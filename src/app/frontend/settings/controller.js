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


// Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
const CONCURRENT_CHANGE_ERROR = 'settings changed since last reload';

const i18n = {
  /** @export {string} @desc Title of "save anyways" dialog from settings page. */
  MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_TITLE: goog.getMsg(`Settings have changed since last reload`),

  /** @export {string} @desc Content of "save anyways" dialog from settings page. */
  MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CONTENT: goog.getMsg(`Do you want to save them anyways?`),

  /** @export {string} @desc Confirm label of "save anyways" dialog from settings page. */
  MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CONFIRM_LABEL: goog.getMsg(`Save`),

  /** @export {string} @desc Cancel label of "save anyways" dialog from settings page. */
  MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CANCEL_LABEL: goog.getMsg(`Refresh`),
};

/**
 * Controller for the settings view.
 *
 * @final
 */
export class SettingsController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!md.$dialog} $mdDialog
   * @param {!../common/settings/service.SettingsService}  kdSettingsService
   * @param {!backendApi.Settings} globalSettings
   * @ngInject
   */
  constructor($resource, $log, $mdDialog, kdSettingsService, globalSettings) {
    /** @export {!angular.FormController} */
    this.globalForm;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!../common/settings/service.SettingsService} */
    this.settingsService_ = kdSettingsService;

    /** @export {!backendApi.Settings} */
    this.global = globalSettings;

    this.saveAnywaysDialog_ = this.mdDialog_.confirm()
                                  .title(i18n.MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_TITLE)
                                  .textContent(i18n.MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CONTENT)
                                  .ok(i18n.MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CONFIRM_LABEL)
                                  .cancel(i18n.MSG_SETTINGS_SAVE_ANYWAYS_DIALOG_CANCEL_LABEL);
  }

  /**
   * @private
   */
  refreshGlobal_() {
    this.resource_('api/v1/settings/global')
        .get(
            (global) => {
              this.global = global;
              this.log_.info('Reloaded global settings: ', global);
            },
            (err) => {
              this.log_.info('Error during global settings reload: ', err);
            });
  }

  /**
   * @export
   */
  saveGlobal() {
    /** @type {!backendApi.Settings} */
    let settings = {
      clusterName: this.global.clusterName,
      itemsPerPage: this.global.itemsPerPage,
      autoRefreshTimeInterval: this.global.autoRefreshTimeInterval,
    };

    /** @type {!angular.Resource} */
    let resource = this.resource_(
        'api/v1/settings/global', {},
        {save: {method: 'PUT', headers: {'Content-Type': 'application/json'}}});

    resource.save(
        settings,
        (savedSettings) => {
          this.log_.info('Successfully saved settings: ', savedSettings);
          // It will disable "save" button until user will modify at least one setting.
          this.globalForm.$setPristine();
          // Reload settings service to apply changes in the whole app without need to refresh.
          this.settingsService_.load();
        },
        (err) => {
          this.log_.error('Error during saving settings:', err);
          if (err && err.data.indexOf(CONCURRENT_CHANGE_ERROR) !== -1) {
            this.mdDialog_.show(this.saveAnywaysDialog_)
                .then(
                    () => {
                      // Backend was refreshed with the PUT request, so the second try will be
                      // successful unless yet another concurrent change will happen. In that case
                      // "save anyways" dialog will be shown again.
                      this.saveGlobal();
                    },
                    () => {
                      this.refreshGlobal_();
                    });
          }
        });
  }
}
