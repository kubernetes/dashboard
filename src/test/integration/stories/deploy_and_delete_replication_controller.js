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

import DeployPageObject from '../deploy/deploy_po';
import DeleteReplicationControllerDialogObject from '../replicationcontrollerdetail/deletereplicationcontroller_po';
import ReplicationControllersPageObject from '../replicationcontrollerslist/replicationcontrollers_po';


// Test assumes, that there are no replication controllers in the cluster at the beginning.
// TODO(#494): Reenable this test when fixed.
xdescribe('Deploy and delete replication controller user story test', () => {

  /** @type {!DeployPageObject} */
  let deployPage;

  /** @type {!DeleteReplicationControllerDialogObject} */
  let deleteReplicationControllerDialog;

  /** @type {!ReplicationControllersPageObject} */
  let replicationControllersPage;

  /** @type {string} */
  let applicationName = `nginx-${generateRandomString()}`;

  /** @type {string} */
  let containerImage = 'nginx';

  /** @type {string} */
  let applicationCardXPath = `//chrome/md-content//span[text() = '${applicationName}']`;

  /**
   * Generates random 13 characters long string.
   * @return {string}
   */
  function generateRandomString() {
    return Math.random().toString(36).substring(2, 15);
  }

  beforeAll(() => {
    deployPage = new DeployPageObject();
    deleteReplicationControllerDialog = new DeleteReplicationControllerDialogObject();
    replicationControllersPage = new ReplicationControllersPageObject();
  });

  it('should go to deploy page', () => {
    browser.get('#/deploy');

    expect(browser.getCurrentUrl()).toContain('deploy');
  });

  it('should fill replication controller details', () => {
    deployPage.appNameField.sendKeys(applicationName);
    deployPage.containerImageField.sendKeys(containerImage);

    expect(deployPage.appNameField.getAttribute('value')).toEqual(applicationName);
    expect(deployPage.containerImageField.getAttribute('value')).toEqual(containerImage);
  });

  it('should deploy replication controller', () => {
    deployPage.deployButton.click().then(() => {
      expect(browser.getCurrentUrl()).toContain('replicationcontroller');
      expect(element(by.xpath(applicationCardXPath))).not.toBeNull();
    });
  });

  it('should open delete replication controller dialog', () => {
    replicationControllersPage
        .getElementByAppName(replicationControllersPage.cardMenuButtonQuery, applicationName, false)
        .click();
    replicationControllersPage.deleteAppButton.click();

    expect(deleteReplicationControllerDialog.deleteDialog).not.toBeNull();
    expect(deleteReplicationControllerDialog.deleteServicesCheckbox.getAttribute('class'))
        .toContain('md-checked');
  });

  it('should delete replication controller', () => {
    deleteReplicationControllerDialog.deleteAppButton.click();

    expect(element(by.xpath(applicationCardXPath)).isPresent()).toBeFalsy();
  });

});
