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
   * @param {!./logs_service.LogsService} logsService
   * @ngInject
   */
  constructor(podLogs, logsService, $sce) {
    /** @export {!Array<string>} Log set. */
    this.logsSet = podLogs.logs.map((line) => {
      let escapedLine = this.escapeHtml(line);
      let formattedLine = ansi_up.ansi_to_html(escapedLine);

      // We know that trustAsHtml is safe here because escapedLine is escaped
      // to not contain any HTML markup, and formattedLine is the result of
      // passing ecapedLine to ansi_to_html, which is known to only add span
      // tags.
      return $sce.trustAsHtml(formattedLine);
    });

    /** @private {!./logs_service.LogsService} */
    this.logsService_ = logsService;
  }

  /**
   * Indicates log area font size.
   * @export
   * @return {string}
   */
  getLogsClass() {
    const logsTextSize = 'kd-logs-element';
    if (this.logsService_.getCompact()) {
      return `${logsTextSize}-compact`;
    }
    return logsTextSize;
  }

  /**
   * Return proper style class for logs content.
   * @export
   * @returns {string}
   */
  getStyleClass() {
    const logsTextColor = 'kd-logs-text-color';
    if (this.logsService_.getInverted()) {
      return `${logsTextColor}-invert`;
    }
    return logsTextColor;
  }

  /**
   * Escapes an HTML string (e.g. converts "<foo>bar&baz</foo>" to
   * "&lt;foo&gt;bar&amp;baz&lt;/foo&gt;") by bouncing it through a text node.
   * @returns {string}
   */
  escapeHtml(html) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(html));
    return div.innerHTML;
  }
}
