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
 * Controller for the logs view.
 *
 * @final
 */
export class LogsController {
  /**
   * @param {!backendApi.Logs} podLogs
   * @param {!./logs_service.LogColorInversionService} logsColorInversionService
   * @ngInject
   */
  constructor(podLogs, logsColorInversionService) {
    /** @export {!Array<string>} Log set. */
    this.logsSet = podLogs.logs;

    /** @private {!./logs_service.LogColorInversionService} */
    this.logsColorInversionService_ = logsColorInversionService;
  }

  /**
   * Indicates state of log area color.
   * If false: black text is placed on white area. Otherwise colors are inverted.
   * @export
   * @return {boolean}
   */
  isTextColorInverted() { return this.logsColorInversionService_.getInverted(); }

  /**
   * Indicates log area font size.
   * @export
   * @return {string}
   */
  getFontSize() { return this.logsColorInversionService_.getFontSize(); }

  /**
   * Return proper style class for logs content.
   * @export
   * @returns {string}
   */
  getStyleClass() {
    const logsTextColor = 'kd-logs-text-color';
    if (this.isTextColorInverted()) {
      return `${logsTextColor}-invert`;
    }
    return `${logsTextColor}`;
  }
}
