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

/** @final */
import {showDownloadDialog} from './dialog';

/** @final */
export class DownloadService {
  /**
   * @param {!angular.$http} $http
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($http, $mdDialog) {
    /** @private {!angular.$http} */
    this.http_ = $http;
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Raw file download function that returns promise which is resolved when file is saved in
   * browser's cache and is available as response.data of type Blob.
   *
   * @param {string} url
   * @param {!function(Object)} progressUpdateFn
   * @param {!angular.$q.Deferred} canceler
   * @return {!angular.$q.Promise}
   */
  downloadFile(url, progressUpdateFn, canceler) {
    return this.http_.get(url, {
      responseType: 'blob',
      timeout: canceler.promise,
      onProgress: (event) => {
        progressUpdateFn(event);
      },
    });
  }

  /**
   * Download function that triggers download dialog. It handles download of file provided in url
   * and allows to save it under provided file name.
   *
   * @param {string} url
   * @param {string} fileName
   */
  download(url, fileName) {
    showDownloadDialog(this.mdDialog_, url, fileName);
  }
}
