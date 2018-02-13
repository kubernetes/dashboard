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

import path from 'path';
import remote from 'selenium-webdriver/remote';

import DeployFromFilePageObject from '../deploy/deployfromfile_po';
import DeleteReplicationControllerDialogObject from '../replicationcontrollerdetail/deletereplicationcontroller_po';
import ReplicationControllersPageObject from '../replicationcontrollerslist/replicationcontrollers_po';


// Test assumes, that there are no replication controllers in the cluster at the beginning.
xdescribe('Deploy from valid file user story test', () => {

  /** @type {!DeployFromFilePageObject} */
  let deployFromFilePage;

  /** @type {!ReplicationControllersPageObject} */
  let replicationControllersPage;

  /** @type {!DeleteReplicationControllerDialogObject} */
  let deleteDialog;

  /** @type {!string} */
  let appName = 'integration-test-valid-rc';

  beforeAll(() => {
    browser.driver.setFileDetector(new remote.FileDetector());
    deployFromFilePage = new DeployFromFilePageObject();
    replicationControllersPage = new ReplicationControllersPageObject();
    deleteDialog = new DeleteReplicationControllerDialogObject();
    browser.get('#!/deploy');
    deployFromFilePage.deployFromFileTab.click();
  });

  it('should upload the file', () => {
    // given
    let fileToUpload = '../deploy/valid-rc.yaml';
    let absolutePath = path.resolve(__dirname, fileToUpload);

    // when
    deployFromFilePage.filePicker.sendKeys(absolutePath);
    deployFromFilePage.deployButton.click();

    // then
    expect(browser.getCurrentUrl()).toContain('overview');

    let cardNameLink = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardDetailsPageLinkQuery, appName);
    expect(cardNameLink.isPresent()).toBe(true);
  });

  afterAll(() => {
    // clean up
    let cardMenuButton = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardMenuButtonQuery, appName);
    browser.get('#!/replicationcontroller');
    cardMenuButton.click();
    replicationControllersPage.deleteAppButton.click().then(() => {
      deleteDialog.deleteAppButton.click();
    });
  });
});
