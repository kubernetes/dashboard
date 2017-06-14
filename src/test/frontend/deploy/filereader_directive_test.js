// Copyright 2017 The Kubernetes Dashboard Authors.
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

import deployModule from 'deploy/module';

describe('File reader directive', () => {
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;
  /** @type {!angular.Scope} */
  let scope;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($compile, $rootScope) => {
      compileFn = $compile('<div kd-upload kd-file-reader form="form" ng-model="file"></div>');
      scope = $rootScope.$new();
      scope.form = {'fileName': '/etc/passwd'};
    });
  });

  // TODO: investigate why on firefox expected file name is ':etc:name' instead of '/etc/passwd'
  xit('should handle file upload', (doneFn) => {
    let elem = compileFn(scope);
    scope.$digest();

    // Ignore on no file.
    elem[0].files = [];
    elem.trigger('change');

    try {
      // This line fails on IE. So ignore the rest of the test on this browser.
      // Testing filereader on all other browsers work, so this should be
      // enough.
      elem[0].files = [new File(['<CONTENT>'], '/etc/passwd')];
    } catch (e) {
      doneFn();
    }
    elem.trigger('change');

    let checkForFile = () => {
      if (scope.file) {
        expect(scope.file.name).toBe('/etc/passwd');
        expect(scope.file.content).toBe('<CONTENT>');
        doneFn();
      } else {
        window.setTimeout(checkForFile, 100);
      }
    };
    checkForFile();
  });
});
