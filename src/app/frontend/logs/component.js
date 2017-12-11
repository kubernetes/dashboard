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

const logsPerView = 100;
const maxLogSize = 2e9;
// Load logs from the beginning of the log file. This matters only if the log file is too large to
// be loaded completely.
const beginningOfLogFile = 'beginning';
// Load logs from the end of the log file. This matters only if the log file is too large to be
// loaded completely.
const endOfLogFile = 'end';
const oldestTimestamp = 'oldest';
const newestTimestamp = 'newest';

/** @final */
export class LogsController {
  /**
   * @param {!./service.LogsService} logsService
   * @param {!angular.$sce} $sce
   * @param {!angular.$document} $document
   * @param {!angular.$resource} $resource
   * @param {!angular.$interval} $interval
   * @param {!../common/errorhandling/dialog.ErrorDialog} errorDialog
   * @param {!../common/settings/service.SettingsService} kdSettingsService
   * @param {!./download/service.DownloadService} kdDownloadService
   * @ngInject
   */
  constructor(
      logsService, $sce, $document, $resource, $interval, errorDialog, kdSettingsService,
      kdDownloadService) {
    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!HTMLDocument} */
    this.document_ = $document[0];

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$interval} */
    this.interval_ = $interval;

    /** @export {!./service.LogsService} */
    this.logsService = logsService;

    /** @export */
    this.i18n = i18n;

    /** @export {!Array<string>} Log set. */
    this.logsSet;

    /** @export {!backendApi.LogDetails} */
    this.podLogs;

    /**
     * Current pod selection
     * @export {string}
     */
    this.pod;

    /**
     * Current container selection
     * @export {string}
     */
    this.container;

    /**
     * Pods and containers available for selection
     * @export {!backendApi.LogSources}
     */
    this.logSources;

    /**
     * Current page selection
     * @private {!backendApi.LogSelection}
     */
    this.currentSelection;

    /** @export {number} */
    this.topIndex = 0;

    /** @private {!../common/errorhandling/dialog.ErrorDialog} */
    this.errorDialog_ = errorDialog;

    /** @private {!ui.router.$stateParams} */
    this.stateParams_;

    /** @export {!kdUiRouter.$transition$} */
    this.$transition$;

    /** @export {number} Refresh interval in miliseconds. */
    this.refreshInterval = 5000;

    /** @private {!angular.$q.Promise|null} */
    this.intervalPromise_ = null;

    /** @private {!../common/settings/service.SettingsService} */
    this.settingsService_ = kdSettingsService;

    /** @private {!./download/service.DownloadService} */
    this.downloadService_ = kdDownloadService;
  }

  $onInit() {
    this.container = this.podLogs.info.containerName;
    this.pod = this.podLogs.info.podName;
    this.stateParams_ = this.$transition$.params();
    this.updateUiModel(this.podLogs);
    this.topIndex = this.podLogs.logs.length;
    this.refreshInterval = this.settingsService_.getAutoRefreshTimeInterval() * 1000;
  }

  $onDestroy() {
    if (this.intervalPromise_) {
      this.interval_.cancel(this.intervalPromise_);
      this.intervalPromise_ = null;
    }
  }

  /**
   * Starts and stops interval function used to automatically refresh logs.
   *
   * @private
   */
  toggleIntervalFunction_() {
    if (this.intervalPromise_) {
      this.interval_.cancel(this.intervalPromise_);
      this.intervalPromise_ = null;
    } else {
      this.intervalPromise_ = this.interval_(() => this.loadNewest(), this.refreshInterval);
    }
  }

  /**
   * Loads maxLogSize oldest lines of logs.
   * @export
   */
  loadOldest() {
    this.loadView(beginningOfLogFile, oldestTimestamp, 0, -maxLogSize - logsPerView, -maxLogSize);
  }

  /**
   * Loads maxLogSize newest lines of logs.
   * @export
   */
  loadNewest() {
    this.loadView(endOfLogFile, newestTimestamp, 0, maxLogSize, maxLogSize + logsPerView);
  }

  /**
   * Shifts view by maxLogSize lines to the past.
   * @export
   */
  loadOlder() {
    this.loadView(
        this.currentSelection.logFilePosition, this.currentSelection.referencePoint.timestamp,
        this.currentSelection.referencePoint.lineNum,
        this.currentSelection.offsetFrom - logsPerView, this.currentSelection.offsetFrom);
  }

  /**
   * Shifts view by maxLogSize lines to the future.
   * @export
   */
  loadNewer() {
    this.loadView(
        this.currentSelection.logFilePosition, this.currentSelection.referencePoint.timestamp,
        this.currentSelection.referencePoint.lineNum, this.currentSelection.offsetTo,
        this.currentSelection.offsetTo + logsPerView);
  }

  /**
   * Toggles log follow mechanism.
   *
   * @export
   */
  toggleLogFollow() {
    this.logsService.setFollowing();
    this.toggleIntervalFunction_();
  }

  /**
   * Downloads and loads slice of logs as specified by offsetFrom and offsetTo.
   * It works just like normal slicing, but indices are referenced relatively to certain reference
   * line.
   * So for example if reference line has index n and we want to download first 10 elements in array
   * we have to use
   * from -n to -n+10.
   * @param {string} logFilePosition
   * @param {string} referenceTimestamp
   * @param {number} referenceLinenum
   * @param {number} offsetFrom
   * @param {number} offsetTo
   * @private
   */
  loadView(logFilePosition, referenceTimestamp, referenceLinenum, offsetFrom, offsetTo) {
    let namespace = this.stateParams_.objectNamespace;
    this.resource_(`api/v1/log/${namespace}/${this.pod}/${this.container}`)
        .get(
            {
              'logFilePosition': logFilePosition,
              'referenceTimestamp': referenceTimestamp,
              'referenceLineNum': referenceLinenum,
              'offsetFrom': offsetFrom,
              'offsetTo': offsetTo,
              'previous': this.logsService.getPrevious(),
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
    if (podLogs.info.truncated) {
      this.errorDialog_.open(this.i18n.MSG_LOGS_TRUNCATED_WARNING, '');
    }
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
        this.sce_.trustAsHtml(new AnsiUp().ansi_to_html(this.escapeHtml_(line.content)));

    // add timestamp if needed
    let showTimestamp = this.logsService.getShowTimestamp();
    return showTimestamp ? `${line.timestamp} ${escapedContent}` : escapedContent;
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
   * Initiate logs download.
   * @export
   */
  downloadLog() {
    let namespace = this.stateParams_.objectNamespace;
    let logUrl = `api/v1/log/file/${namespace}/${this.pod}/${this.container}?previous=${
        this.logsService.getPrevious()}`;
    this.downloadService_.download(
        logUrl, this.logsService.getLogFileName(this.pod, this.container));
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
   * Execute when a user changes the selected option for show previous container logs.
   * @export
   */
  onPreviousChange() {
    this.logsService.setPrevious();
    this.loadNewest();
  }
}

/**
 * Returns component definition for logs component.
 *
 * @type {!angular.Component}
 */
export const logsComponent = {
  controller: LogsController,
  controllerAs: 'ctrl',
  templateUrl: 'logs/logs.html',
  bindings: {
    'logSources': '<',
    'podLogs': '<',
    '$transition$': '<',
  },
};

const i18n = {
  /** @export {string} @desc Text for logs card zerostate in logs page. */
  MSG_LOGS_ZEROSTATE_TEXT: goog.getMsg('The selected container has not logged any messages yet.'),
  /**
   @export {string} @desc Error dialog indicating that parts of the log file is missing due to memory constraints.
   */
  MSG_LOGS_TRUNCATED_WARNING:
      goog.getMsg('The middle part of the log file cannot be loaded, because it is too big.'),
};
