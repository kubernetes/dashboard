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

// import PageObject from './zerostate_po';

describe('Zero state view', () => {
  // let page;

  beforeEach(() => {
    browser.get('#/zerostate');
    // page = new PageObject();
  });

  // TODO: Enable this test to be able test zerostate page.
  // Currently after cluster installation the Heapster service is deployed. It causes situation that
  // zerostate page is redirected to replicasets and never displayed. Some solution is needed to be
  // able test zerostate page.
  // it('should do something', () => { expect(page.deployButton.getText()).toContain('DEPLOY'); });
});
