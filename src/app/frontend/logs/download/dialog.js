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

import {kdLocalizedErrors} from '../../common/errorhandling/errors';

/** @const {number} */
const PROGRESS_UPDATE_TIMEOUT = 500;

/** @final */
export class DownloadDialogController {
  /**
   * @param {string} downloadUrl
   * @param {string} fileName
   * @param {!kdFileApi.FileSaver} FileSaver
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$q} $q
   * @param {!./service.DownloadService} kdDownloadService
   * @param {!angular.$timeout} $timeout
   * @ngInject
   */
  constructor(downloadUrl, fileName, FileSaver, $mdDialog, $q, kdDownloadService, $timeout) {
    /** @private {string} */
    this.downloadUrl_ = downloadUrl;
    /** @private {string} */
    this.fileName_ = fileName;
    /** @export {number} */
    this.loaded = 0;
    /** @private {number} */
    this.lastLoaded_ = 0;
    /** @private {boolean} */
    this.finished = false;
    /** @private {!kdFileApi.FileSaver} */
    this.fileSaver_ = FileSaver;
    /** @private {Blob} */
    this.data;
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
    /** @private {!angular.$q.Deferred} */
    this.canceler_ = $q.defer();
    /** @private {./service.DownloadService} */
    this.downloadService_ = kdDownloadService;
    /** @private {angular.$timeout} */
    this.timeout_ = $timeout;
    /** @private {angular.$q.Promise|undefined} */
    this.progressUpdateTimeoutFinished_;
    /** @export {number} */
    this.error;
    /** @export {Object} */
    this.kdLocalizerErrors = kdLocalizedErrors;
  }

  /** @export */
  $onInit() {
    this.downloadService_
        .downloadFile(this.downloadUrl_, this.progressUpdateCallback_.bind(this), this.canceler_)
        .then(this.downloadFinishedCallback_.bind(this))
        .catch((err) => {
          this.error = err.status;
        });
  }

  /**
   * @param {Object} event
   * @private
   */
  progressUpdateCallback_(event) {
    this.lastLoaded_ = event.loaded;

    if (this.progressUpdateTimeoutFinished_) {
      return;
    }

    this.progressUpdateTimeoutFinished_ = this.timeout_(() => {
      this.progressUpdateTimeoutFinished_ = undefined;
      this.updateProgress_(event.loaded);
    }, PROGRESS_UPDATE_TIMEOUT);
  }

  /**
   * @param {!angular.$http.Response} response
   * @private
   */
  downloadFinishedCallback_(response) {
    this.data = response.data;
    this.finished = true;
    this.timeout_.cancel(this.progressUpdateTimeoutFinished_);
    this.loaded = this.lastLoaded_;
  }

  /**
   * @param {number} loaded
   * @private
   */
  updateProgress_(loaded) {
    this.loaded = loaded;
  }

  /**
   * @return {boolean}
   * @export
   */
  hasDownloadFinished() {
    return this.finished;
  }

  /** @export */
  save() {
    this.fileSaver_.saveAs(this.data, this.fileName_);
    this.mdDialog_.hide();
  }

  /** @export */
  abort() {
    this.canceler_.resolve();
    this.mdDialog_.hide();
  }

  /**
   * @return {string}
   * @export
   */
  getDownloadMode() {
    return this.finished ? 'determinate' : 'indeterminate';
  }

  /**
   * @return {boolean}
   * @export
   */
  hasForbiddenError() {
    return this.error !== undefined && this.error === 403;
  }
}

/**
 * @param {!md.$dialog} mdDialog
 * @param {string} downloadUrl
 * @param {string} fileName
 */
export function showDownloadDialog(mdDialog, downloadUrl, fileName) {
  return mdDialog.show({
    controller: DownloadDialogController,
    controllerAs: '$ctrl',
    locals: {
      'downloadUrl': downloadUrl,
      'fileName': fileName,
    },
    templateUrl: 'logs/download/dialog.html',
    escapeToClose: false,
  });
}
