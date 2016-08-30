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
   * @param {!angular.$sce} $sce
   * @param {!angular.$document} $document
   * @ngInject
   */
  constructor(podLogs, logsService, $sce, $document) {
    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!HTMLDocument} */
    this.document_ = $document[0];

    /** @export {!Array<string>} Log set. */
    this.logsSet = this.sanitizeLogs_(podLogs.logs);

    /** @private {!./logs_service.LogsService} */
    this.logsService_ = logsService;

    /** @export */
    this.i18n = i18n;
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
   * Removes empty lines and formats logs as HTML.
   *
   * @param {!Array<string>} logs
   * @return {!Array<string>}
   * @private
   */
  sanitizeLogs_(logs) {
    return logs.filter((line) => line !== '').map((line) => this.formatLine_(line));
  }

  /**
   * Formats the given log line as raw HTML to display to the user.
   * @param {string} line
   * @return {*}
   * @private
   */
  formatLine_(line) {
    let escapedLine = this.escapeHtml_(line);
    let formattedLine = ansi_up.ansi_to_html(escapedLine);

    // We know that trustAsHtml is safe here because escapedLine is escaped to
    // not contain any HTML markup, and formattedLine is the result of passing
    // ecapedLine to ansi_to_html, which is known to only add span tags.
    return this.sce_.trustAsHtml(formattedLine);
  }

  /**
   * Escapes an HTML string (e.g. converts "<foo>bar&baz</foo>" to
   * "&lt;foo&gt;bar&amp;baz&lt;/foo&gt;") by bouncing it through a text node.
   * @param {string} html
   * @return {string}
   * @private
   */
  escapeHtml_(html) {
    let div = this.document_.createElement('div');
    div.appendChild(this.document_.createTextNode(html));
    return div.innerHTML;
  }
}

const i18n = {
  /** @export {string} @desc Title for logs card zerostate in logs page. */
  MSG_LOGS_ZEROSTATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for logs card zerostate in logs page. */
  MSG_LOGS_ZEROSTATE_TEXT:
      goog.getMsg('The selected container has not logged any messages yet.'),
};
