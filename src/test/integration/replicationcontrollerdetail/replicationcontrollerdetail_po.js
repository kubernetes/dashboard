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

export default class ReplicationControllerDetailPageObject {
  constructor() {
    this.mdTabItemsQuery = by.tagName('md-tab-item');

    this.eventsTab = element.all(this.mdTabItemsQuery).get(1);
    this.podsTab = element.all(this.mdTabItemsQuery).get(0);

    this.eventsTypeFilterQuery = by.model('ctrl.eventType');
    this.eventsTypeFilter = element(this.eventsTypeFilterQuery);

    this.eventsTypeWarningQuery = by.css('md-option[value="Warning"]');
    this.eventsTypeWarning = element(this.eventsTypeWarningQuery);

    this.eventsTableQuery = by.id('kd-replicationcontrollerdetail-events-table');
    this.eventsTable = element(this.eventsTableQuery);

    this.podLogsLinkQuery = by.css('td[kd-responsive-header="Logs"');
    this.podLogsLink = element(this.podLogsLinkQuery).element(by.css('a'));
  }
}
