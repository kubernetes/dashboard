/** @final */
import {showDownloadDialog} from "./dialog";

export class DownloadService {
  /**
   * @ngInject
   */
  constructor($http, $mdDialog, $timeout, FileSaver) {
    /** @private {!angular.$resource} */
    this.http_ = $http;

    this.mdDialog_ = $mdDialog;

    this.timeout_ = $timeout;

    this.fileSaver_ = FileSaver;
  }

  /**
   * @param {string} url
   * @param {!function(Object)} progressUpdateFn
   * @param {!angular.$q} canceler
   * @return {!angular.$q.Promise}
   */
  downloadFile(url, progressUpdateFn, canceler) {
    return this.http_.get(url, {
      responseType: 'blob',
      timeout: canceler.promise,
      onProgress: (event) => {progressUpdateFn(event)}
    });
  }

  startDownload(url, fileName) {
    showDownloadDialog(this.mdDialog_, url, fileName);
  }
}
