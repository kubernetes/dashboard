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

export default class ReplicationControllersPageObject {
  constructor() {
    this.cardMenuButtonQuery =
        `md-menu/button[contains(@class, 'kd-replicationcontroller-card-menu-button')]`;
    this.cardErrorIconQuery = `span/md-icon[contains(@class, 'md-warn')]`;
    this.cardDetailsPageLinkQuery = `a[@class='kd-replicationcontroller-card-name']`;
    this.cardErrorsQuery = `span[contains(@class, 'kd-replicationcontroller-card-error')]`;
    this.deleteAppButtonQuery =
        by.xpath('//div[@aria-hidden="false"]/md-menu-content/md-menu-item[3]/button');

    this.deleteAppButton = element(this.deleteAppButtonQuery);
  }

  /**
   * @param {string} xpathString - xpath string starting from card 'md-card-content' tag
   * @param {string} appName - app name of the card we want to get related elements from
   * @param {?boolean} isArray - should be true if more than 1 element may fit queryString
   * @return {!Element}
   */
  getElementByAppName(xpathString, appName, isArray) {
    let elemQuery = by.xpath(`//*[text()='${appName}']/ancestor::md-card-content//${xpathString}`);
    if (isArray) {
      return element.all(elemQuery);
    }

    return element(elemQuery);
  }
}
