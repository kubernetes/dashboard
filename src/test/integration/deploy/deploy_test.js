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

describe('Deploy view', function() {
  beforeEach(function() { browser.get('#/deploy'); });

  it('should not contain errors in console', function() {
    browser.manage().logs().get('browser').then(function(browserLog) {
      // Filter and search for errors logs
      let filteredLogs = browserLog.filter((log) => { return log.level.value > 900; });

      // Expect no error logs
      expect(filteredLogs.length).toBe(0);
    });
  });
});
