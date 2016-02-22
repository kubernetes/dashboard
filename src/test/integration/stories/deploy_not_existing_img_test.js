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
  let timeout = 10000;  // 10s

  /**
   * Waits for element to be present on the page. It doesn't have to be displayed yet.
   * Additional logic can be given in 'isPresentConditionFn' to f.e. refresh page periodically
   * until given element appears on the page.
   * @param {!Element} elm
   * @param {?function(boolean): boolean} isPresentConditionFn
   */
  function waitUntilPresent(elm, isPresentConditionFn) {
    browser.driver.wait(() => {
      if (!isPresentConditionFn) {
        return elm.isPresent();
      }

      return elm.isPresent().then(isPresentConditionFn);
    }, timeout);
  }

  /**
   * Logic is the same as for waitUntilPresent function with the exception that it
   * waits for the element to be actually displayed on the page.
   * @param {!Element} elm
   * @param {?function(boolean): boolean} isPresentConditionFn
   */
  function waitUntilDisplayed(elm, isPresentConditionFn) {
    browser.driver.wait(() => {
      if (!isPresentConditionFn) {
        return elm.isDisplayed();
      }

      return elm.isDisplayed().then(isPresentConditionFn);
    }, timeout);
  }

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
    browser.driver.sleep(1000);

    // then
    expect(browser.getCurrentUrl()).toContain('deploy');
  });

  it('should deploy app and go to replication controllers list page', () => {
    // given
    deployPage.appNameField.sendKeys(appName);
    deployPage.containerImageField.sendKeys(containerImage);

    // when
    deployPage.deployButton.click();
    browser.driver.sleep(1000);

    // then
    expect(browser.getCurrentUrl()).toContain('replicationcontrollers');
  });

  it('should wait for card to be in error state', () => {
    // when
    waitUntilPresent(replicationControllersPage.cardErrorIcon, (result) => {
      if (result) {
        return true;
      }

      browser.driver.navigate().refresh();
      browser.driver.sleep(1000);
      return false;
    });

    // then
    expect(replicationControllersPage.cardErrorIcon.isDisplayed()).toBeTruthy();
    replicationControllersPage.cardErrors.then((errors) => { expect(errors.length).not.toBe(0); });
  });

  it('should go to details page', () => {
    // when
    replicationControllersPage.cardDetailsPageLink.click();
    browser.driver.sleep(3000);

    // then
    expect(browser.getCurrentUrl()).toContain(`replicationcontrollers/default/${appName}`);
  });

  it('should switch to events tab and check for errors', () => {
    // when
    // Switch to events tab
    replicationControllerDetailPage.eventsTab.click();
    browser.driver.sleep(1000);

    // Filter events by warnings
    replicationControllerDetailPage.eventsTypeFilter.click().then(() => {
      waitUntilPresent(replicationControllerDetailPage.eventsTypeWarning);
      replicationControllerDetailPage.eventsTypeWarning.click();
    });

    // then
    waitUntilDisplayed(replicationControllerDetailPage.eventsTable);
    expect(replicationControllerDetailPage.eventsTable.isDisplayed()).toBeTruthy();
  });

  it('should switch to pods tab and go to pod logs page', () => {
    // when
    // Switch to pods tab
    replicationControllerDetailPage.podsTab.click();
    browser.driver.sleep(1000);

    // Click pod log link
    replicationControllerDetailPage.podLogsLink.click();
    browser.driver.sleep(5000);

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
    browser.get('#/replicationcontrollers');

    replicationControllersPage.cardMenuButton.click();
    replicationControllersPage.deleteAppButton.click().then(() => {
      waitUntilPresent(deleteDialog.deleteAppButton);
      deleteDialog.deleteAppButton.click();
    });
  });
});
