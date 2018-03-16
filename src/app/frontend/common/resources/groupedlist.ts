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

import {OnListChangeEvent} from '@api/frontendapi';
import {ListGroupIdentifiers} from '../components/resourcelist/groupids';

export class GroupedResourceList {
  private readonly items_: {[id: string]: number} = {};
  private readonly groupItems_: {[groupId: string]: {[id: string]: number}} = {
    [ListGroupIdentifiers.cluster]: {},
    [ListGroupIdentifiers.workloads]: {},
    [ListGroupIdentifiers.discovery]: {},
    [ListGroupIdentifiers.config]: {},
  };

  shouldShowZeroState(): boolean {
    let totalItems = 0;
    const ids = Object.keys(this.items_);
    ids.forEach(id => totalItems += this.items_[id]);
    return totalItems === 0 && ids.length > 0;
  }

  isGroupVisible(groupId: string): boolean {
    let totalItems = 0;
    const ids = Object.keys(this.groupItems_[groupId]);
    ids.forEach(id => totalItems += this.groupItems_[groupId][id]);
    return totalItems > 0;
  }

  onListUpdate(listEvent: OnListChangeEvent): void {
    this.items_[listEvent.id] = listEvent.items;
    if (!(listEvent.id in this.groupItems_[listEvent.groupId])) {
      this.groupItems_[listEvent.groupId][listEvent.id] = listEvent.items;
    }

    if (listEvent.filtered) {
      this.items_[listEvent.id] = 1;
    }
  }
}
