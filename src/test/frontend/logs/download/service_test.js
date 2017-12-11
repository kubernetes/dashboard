import LogsModule from 'logs/module';

describe('Download service ', () => {
  let service;
  let httpBackend;
  let q;
  let mdDialog;

  beforeEach(() => {
    angular.mock.module(LogsModule.name);
    angular.mock.inject((kdDownloadService, $httpBackend, $q) => {
      service = kdDownloadService;
      mdDialog = service.mdDialog_;
      httpBackend = $httpBackend;
      q = $q;
    });
  });

  it('should download file', () => {
    // given
    let url = 'api/v1/log/file/test';
    let response = {data: 'mockData'};
    httpBackend.whenGET(url).respond({
      data: response.data,
    });

    // when
    service.downloadFile(url, () => {}, q.defer()).then((file) => {
      // then
      expect(file.data).toEqual(response);
    });
    httpBackend.flush();
  });

  it('should open download dialog', () => {
    // given
    let url = 'api/v1/log/file/test';
    let fileName = 'test.txt';
    spyOn(mdDialog, 'show');

    // when
    service.download(url, fileName);

    // then
    expect(mdDialog.show).toHaveBeenCalled();
  });
});
