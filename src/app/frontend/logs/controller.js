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

import {stateName as logs, StateParams} from './state';

const logsPerView = 100;
const maxLogSize = 2e9;
/**
 * Controller for the logs view.
 *
 * @final
 */
export class LogsController {
  /**
   * @param {!backendApi.LogDetails} podLogs
   * @param {!backendApi.PodContainerList} podContainers
   * @param {!./service.LogsService} logsService
   * @param {!angular.$sce} $sce
   * @param {!angular.$document} $document
   * @param {!./state.StateParams} $stateParams
   * @param {!angular.$resource} $resource
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor(
      podLogs, podContainers, logsService, $sce, $document, $resource, $stateParams, $state) {
    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!HTMLDocument} */
    this.document_ = $document[0];

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!./state.StateParams} $stateParams */
    this.stateParams_ = $stateParams;

    /** @export {!./service.LogsService} */
    this.logsService = logsService;

    /** @export */
    this.i18n = i18n;

    /** @export {!Array<string>} Log set. */
    this.logsSet;

    /** @export {!backendApi.LogDetails} */
    this.podLogs = podLogs;

    /** @private {!backendApi.LogSelection}*/
    this.currentSelection;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export {!Array<string>} */
    this.containers = podContainers.containers;

    /** @export {string} */
    this.container = this.podLogs.info.containerName;

    /** @export {number} */
    this.topIndex = 0;
  }

  $onInit() {
    this.updateUiModel(this.podLogs);
    this.topIndex = this.podLogs.logs.length;
  }


  /**
   * Loads maxLogSize oldest lines of logs.
   * @export
   */
  loadOldest() {
    this.loadView(-maxLogSize - logsPerView, -maxLogSize);
  }

  /**
   * Loads maxLogSize newest lines of logs.
   * @export
   */
  loadNewest() {
    this.loadView(maxLogSize, maxLogSize + logsPerView);
  }

  /**
   * Shifts view by maxLogSize lines to the past.
   * @export
   */
  loadOlder() {
    this.loadView(this.currentSelection.offsetFrom - logsPerView, this.currentSelection.offsetFrom);
  }

  /**
   * Shifts view by maxLogSize lines to the future.
   * @export
   */
  loadNewer() {
    this.loadView(this.currentSelection.offsetTo, this.currentSelection.offsetTo + logsPerView);
  }

  /**
   * Downloads and loads slice of logs as specified by offsetFrom and offsetTo.
   * It works just like normal slicing, but indices are referenced relatively to certain reference
   * line.
   * So for example if reference line has index n and we want to download first 10 elements in array
   * we have to use
   * from -n to -n+10.
   * @param {number} offsetFrom
   * @param {number} offsetTo
   * @private
   */
  loadView(offsetFrom, offsetTo) {
    let namespace = this.stateParams_.objectNamespace;
    let podId = this.stateParams_.objectName;
    let container = this.stateParams_.container || '';

    this.resource_(`api/v1/pod/${namespace}/${podId}/log/${container}`)
        .get(
            {
              'referenceTimestamp': this.currentSelection.referencePoint.timestamp,
              'referenceLineNum': this.currentSelection.referencePoint.lineNum,
              'offsetFrom': offsetFrom,
              'offsetTo': offsetTo,
            },
            (podLogs) => {
              this.updateUiModel(podLogs);
            });
  }

  /**
   * Updates all state parameters and sets the current log view with the data returned from the
   * backend If logs are not available sets logs to no logs available message.
   * @param {!backendApi.LogDetails} podLogs
   * @private
   */
  updateUiModel(podLogs) {
    this.podLogs = podLogs;
    this.currentSelection = podLogs.selection;
    this.logsSet = this.formatAllLogs_(podLogs.logs);
  }

  /**
   * Formats logs as HTML.
   *
   * @param {!Array<backendApi.LogLine>} logs
   * @return {!Array<string>}
   * @private
   */
  formatAllLogs_(logs) {
    if (logs.length === 0) {
      logs = [{timestamp: '0', content: this.i18n.MSG_LOGS_ZEROSTATE_TEXT}];
    }
    return logs.map((line) => this.formatLine_(line));
  }


  /**
   * Formats the given log line as raw HTML to display to the user.
   * @param {!backendApi.LogLine} line
   * @return {*}
   * @private
   */
  formatLine_(line) {
    // remove html and add colors
    // We know that trustAsHtml is safe here because escapedLine is escaped to
    // not contain any HTML markup, and formattedLine is the result of passing
    // ecapedLine to ansi_to_html, which is known to only add span tags.
    let escapedContent =
        this.sce_.trustAsHtml(ansi_up.ansi_to_html(this.escapeHtml_(line.content)));

    // add timestamp if needed
    let showTimestamp = this.logsService.getShowTimestamp();
    let logLine = showTimestamp ? `${line.timestamp} ${escapedContent}` : escapedContent;

    return logLine;
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


  /**
   * Indicates log area font size.
   * @export
   * @return {string}
   */
  getLogsClass() {
    const logsTextSize = 'kd-logs-element';
    if (this.logsService.getCompact()) {
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
    if (this.logsService.getInverted()) {
      return `${logsTextColor}-invert`;
    }
    return logsTextColor;
  }

  /**
   * Return proper style class for text color icon.
   * @export
   * @returns {string}
   */
  getColorIconClass() {
    const logsTextColor = 'kd-logs-color-icon';
    if (this.logsService.getInverted()) {
      return `${logsTextColor}-invert`;
    }
    return logsTextColor;
  }

  /**
   * Return proper style class for font size icon.
   * @export
   * @returns {string}
   */
  getSizeIconClass() {
    const logsTextColor = 'kd-logs-size-icon';
    if (this.logsService.getCompact()) {
      return `${logsTextColor}-compact`;
    }
    return logsTextColor;
  }

  /**
   * Return the proper icon depending on the selection state
   * @export
   * @returns {string}
   */
  getTimestampIcon() {
    if (this.logsService.getShowTimestamp()) {
      return 'timer';
    }
    return 'timer_off';
  }


  /**
   * Execute when a user changes the selected option of a container element.
   * @param {string} container
   * @export
   */
  onContainerChange(container) {
    this.state_.go(
        logs,
        new StateParams(
            this.stateParams_.objectNamespace, this.stateParams_.objectName, container));
  }

  /**
   * Execute when a user changes the selected option for console font size.
   * @export
   */
  onFontSizeChange() {
    this.logsService.setCompact();
  }

  /**
   * Execute when a user changes the selected option for console color.
   * @export
   */
  onTextColorChange() {
    this.logsService.setInverted();
  }

  /**
   * Execute when a user changes the selected option for show timestamp.
   * @export
   */
  onShowTimestamp() {
    this.logsService.setShowTimestamp();
    this.logsSet = this.formatAllLogs_(this.podLogs.logs);
  }

  /**
   * Find Pod by name.
   * Return object or undefined if can not find an object.
   * @param {!Array<!backendApi.ReplicationControllerPodWithContainers>} array
   * @param {!string} name
   * @return {!backendApi.ReplicationControllerPodWithContainers|undefined}
   * @private
   */
  findPodByName_(array, name) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name) {
        return array[i];
      }
    }
    return undefined;
  }

  /**
   * Find Container by name.
   * Return object or undefined if can not find an object.
   * @param {!Array<!backendApi.PodContainer>} array
   * @param {string} name
   * @return {!backendApi.PodContainer}
   * @private
   */
  initializeContainer_(array, name) {
    let container = undefined;
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === name) {
        container = array[i];
        break;
      }
    }
    if (!container) {
      container = array[0];
    }
    return container;
  }
}

const i18n = {
  /** @export {string} @desc Text for logs card zerostate in logs page. */
  MSG_LOGS_ZEROSTATE_TEXT: goog.getMsg('The selected container has not logged any messages yet.'),
};
