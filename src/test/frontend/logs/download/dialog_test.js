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
