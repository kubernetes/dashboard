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

import {DownloadDialogController} from 'logs/download/dialog';
import LogsModule from 'logs/module';

describe('Download dialog controller ', () => {
  let ctrl;
  let downloadService;
  let httpBackend;
  let mdDialog;
  let fileSaver;

  let downloadUrl = 'api/v1/log/file/test';
  let fileName = 'test.txt';

  beforeEach(() => {
    angular.mock.module(LogsModule.name);
    angular.mock.inject(($controller, kdDownloadService, $httpBackend, $mdDialog, FileSaver) => {
      downloadService = kdDownloadService;
      httpBackend = $httpBackend;
      mdDialog = $mdDialog;
      fileSaver = FileSaver;
      ctrl = $controller(DownloadDialogController, {
        downloadUrl: downloadUrl,
        fileName: fileName,
        kdDownloadService: downloadService,
        $mdDialog: mdDialog,
        FileSaver: fileSaver,
      });
    });
  });

  it('should create controller', () => {
    expect(ctrl).toBeDefined();
  });

  it('should trigger file download on init', () => {
    // given
    spyOn(downloadService, 'downloadFile').and.callThrough();

    // when
    ctrl.$onInit();

    // then
    expect(downloadService.downloadFile).toHaveBeenCalled();
  });

  it('should enable save button once download has finished', () => {
    // given
    httpBackend.whenGET(downloadUrl).respond({});

    // when
    ctrl.$onInit();
    httpBackend.flush();

    // then
    expect(ctrl.hasDownloadFinished()).toBeTruthy();
  });

  it('should change progress bar mode after download has finished', () => {
    // given
    httpBackend.whenGET(downloadUrl).respond({});
    expect(ctrl.getDownloadMode()).toEqual('indeterminate');

    // when
    ctrl.$onInit();
    httpBackend.flush();

    // then
    expect(ctrl.getDownloadMode()).toEqual('determinate');
  });

  it('should hide the dialog on abort', () => {
    // given
    spyOn(mdDialog, 'hide');

    // when
    ctrl.abort();

    // then
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should trigger file save and close the dialog', () => {
    // given
    spyOn(mdDialog, 'hide');
    spyOn(fileSaver, 'saveAs');

    // when
    ctrl.save();

    // then
    expect(mdDialog.hide).toHaveBeenCalled();
    expect(fileSaver.saveAs).toHaveBeenCalled();
  });
});
