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

import DeployFromFilePageObject from './deployfromfile_po';

describe('Deploy from file view', () => {
  /** @type {!DeployFromFilePageObject} */
  let page;

  beforeEach(() => {
    page = new DeployFromFilePageObject();

    browser.get('#!/deploy/file');
    // switches to deploy from file
    page.deployFromFileRadioButton.click();
  });

  it('should have error after clicking deploy without selecting file', () => {
    // when
    page.deployButton.click();

    // then
    expect(page.inputContainer.getAttribute('class')).toContain('md-input-invalid');
  });
});
