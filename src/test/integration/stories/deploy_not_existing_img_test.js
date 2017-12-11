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

import DeployPageObject from '../deploy/deploy_po';
import DeploymentPageObject from '../deploymentlist/deployment_po';
import DeleteReplicationControllerDialogObject from '../replicationcontrollerdetail/deletereplicationcontroller_po';
import ReplicationControllerDetailPageObject from '../replicationcontrollerdetail/replicationcontrollerdetail_po';


/**
 * This integration test will check complete user story in given order:
 *  - [Zerostate Page] - go to deploy page
 *  - [Deploy Page] - provide data for not existing image and click deploy
 *  - [Replication Controller List Page] - wait for card status error to appear and go to
 *                                         details page
 *  - [Replication Controller Details Page] - See events table
 *  - [Replication Controller Details Page] - See pods table and click on Logs link near the
 *                                            existing pod
 *  - [Logs Page] - Check if pod logs show that pod is in pending state.
 *  - Clean up and delete created resources
 */
describe('Deploy not existing image story', () => {

  /** @type {!DeployPageObject} */
  let deployPage;

  /** @type {!DeploymentPageObject} */
  let replicationControllersPage;

  /** @type {!DeleteReplicationControllerDialogObject} */
  let deleteDialog;

  /** @type {!ReplicationControllerDetailPageObject} */
  let replicationControllerDetailPage;

  let appName = `test-${Date.now()}`;
  let containerImage = 'test';

  beforeAll(() => {
    deployPage = new DeployPageObject();
    replicationControllersPage = new DeploymentPageObject();
    deleteDialog = new DeleteReplicationControllerDialogObject();
    replicationControllerDetailPage = new ReplicationControllerDetailPageObject();
  });

  it('should deploy app', (doneFn) => {
    browser.get('#!/deploy');
    deployPage.deployFromSettingsTab.click();

    deployPage.appNameField.sendKeys(appName);
    deployPage.containerImageField.sendKeys(containerImage);

    deployPage.deployButton.click().then(() => {
      expect(browser.getCurrentUrl()).toContain('overview');
      doneFn();
    });

    // it should wait for card to be in error state

    // given
    let cardErrors = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardErrorsQuery, appName, true);
    let cardErrorIcon = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardErrorIconQuery, appName);

    // when
    browser.driver.wait(() => {
      return cardErrorIcon.isPresent().then((result) => {
        if (result) {
          return true;
        }

        browser.driver.navigate().refresh();
        return false;
      });
    });

    // then
    expect(cardErrorIcon.isDisplayed()).toBeTruthy();
    cardErrors.then((errors) => {
      expect(errors.length).not.toBe(0);
    });

    // it should go to details page

    // given
    let cardDetailsPageLink = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardDetailsPageLinkQuery, appName);

    // when
    cardDetailsPageLink.click();

    // then
    expect(browser.getCurrentUrl()).toContain(`deployment/default/${appName}`);

    // Checks whether events table is displayed.
    expect(replicationControllerDetailPage.eventsTable.isDisplayed()).toBeTruthy();

  });

  // Clean up and delete created resources
  afterAll((doneFn) => {
    let cardMenuButton = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardMenuButtonQuery, appName);

    browser.get('#!/deployment');

    cardMenuButton.click();
    replicationControllersPage.deleteAppButton.click().then(() => {
      deleteDialog.deleteAppButton.click();
      doneFn();
    });
  });
});
