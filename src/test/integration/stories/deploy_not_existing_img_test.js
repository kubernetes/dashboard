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
import LogsPageObject from '../logs/logs_po';
import ReplicationControllersPageObject from '../replicationcontrollerslist/replicationcontrollers_po';
import ReplicationControllerDetailPageObject from '../replicationcontrollerdetail/replicationcontrollerdetail_po';
import ZeroStatePageObject from '../zerostate/zerostate_po';

/**
 * This integration test will check complete user story in given order:
 *  - [Zerostate Page] - go to deploy page
 *  - [Deploy Page] - provide data for not existing image and click deploy
 *  - [Replication Controller List Page] - wait for card status error to appear and go to
 *                                         details page
 *  - [Replication Controller Details Page] - Go to events tab, filter by warnings and check
 *                                            results
 *  - [Replication Controller Details Page] - Go to Pods tab and click on Logs link near the
 *                                            existing pod
 *  - [Logs Page] - Check if pod logs show that pod is in pending state.
 *  - Clean up and delete created resources
 */
describe('Deploy not existing image story', () => {
  /** @type {!ZeroStatePageObject} */
  let zeroStatePage;

  /** @type {!DeployPageObject} */
  let deployPage;

  /** @type {!ReplicationControllersPageObject} */
  let replicationControllersPage;

  /** @type {!DeleteReplicationControllerDialogObject} */
  let deleteDialog;

  /** @type {!ReplicationControllerDetailPageObject} */
  let replicationControllerDetailPage;

  /** @type {!LogsPageObject} */
  let logsPage;

  let appName = 'test';
  let containerImage = 'test';

  beforeAll(() => {
    // For empty cluster this should actually redirect to zerostate page
    browser.get('#/replicationcontrollers');

    zeroStatePage = new ZeroStatePageObject();
    deployPage = new DeployPageObject();
    replicationControllersPage = new ReplicationControllersPageObject();
    deleteDialog = new DeleteReplicationControllerDialogObject();
    replicationControllerDetailPage = new ReplicationControllerDetailPageObject();
    logsPage = new LogsPageObject();
  });

  it('should go to deploy page', () => {
    // when
    zeroStatePage.deployButton.click();

    // then
    expect(browser.getCurrentUrl()).toContain('deploy');
  });

  it('should deploy app and go to replication controllers list page', () => {
    // given
    deployPage.appNameField.sendKeys(appName);
    deployPage.containerImageField.sendKeys(containerImage);

    // when
    deployPage.deployButton.click();

    // then
    expect(browser.getCurrentUrl()).toContain('replicationcontrollers');
  });

  it('should wait for card to be in error state', () => {
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
    cardErrors.then((errors) => { expect(errors.length).not.toBe(0); });
  });

  it('should go to details page', () => {
    // given
    let cardDetailsPageLink = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardDetailsPageLinkQuery, appName);

    // when
    cardDetailsPageLink.click();

    // then
    expect(browser.getCurrentUrl()).toContain(`replicationcontrollers/default/${appName}`);
  });

  it('should switch to events tab and check for errors', () => {
    // when
    // Switch to events tab
    replicationControllerDetailPage.eventsTab.click();

    // Filter events by warnings
    replicationControllerDetailPage.eventsTypeFilter.click().then(
        () => { replicationControllerDetailPage.eventsTypeWarning.click(); });

    // then
    expect(replicationControllerDetailPage.eventsTable.isDisplayed()).toBeTruthy();
  });

  it('should switch to pods tab and go to pod logs page', () => {
    // when
    // Switch to pods tab
    replicationControllerDetailPage.podsTab.click();

    // Click pod log link
    replicationControllerDetailPage.podLogsLink.click();

    // then
    // Logs page is opened in new window so we have to switch browser focus to that window.
    browser.getAllWindowHandles().then((handles) => {
      let logsWindowHandle = handles[1];
      browser.switchTo().window(logsWindowHandle).then(() => {
        expect(browser.getCurrentUrl()).toContain(`logs/default/${appName}`);
      });
    });
  });

  it('pod logs should show pending state', () => {
    logsPage.logEntries.then((logEntries) => {
      expect(logEntries.length).toBe(1);
      let logEntryText = logEntries[0].getText();
      expect(logEntryText).toContain('State: "Pending"');
    });
  });

  // Clean up and delete created resources
  afterAll(() => {
    let cardMenuButton = replicationControllersPage.getElementByAppName(
        replicationControllersPage.cardMenuButtonQuery, appName);

    browser.get('#/replicationcontrollers');

    cardMenuButton.click();
    replicationControllersPage.deleteAppButton.click().then(
        () => { deleteDialog.deleteAppButton.click(); });
  });
});
