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
