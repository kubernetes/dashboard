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

import {HttpParams} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {History, HistoryList} from '@api/root.api';
import {Observable} from 'rxjs';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-history-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryListComponent extends ResourceListWithStatuses<HistoryList, History> {
  @Input() title: string;
  @Input() endpoint = EndpointManager.resource(Resource.history, true).list();
  @Input() showMetrics = false;

  constructor(
    private readonly history_: NamespacedResourceService<HistoryList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('history', notifications, cdr);
    this.id = ListIdentifier.history;
    this.groupId = ListGroupIdentifier.workloads;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<HistoryList> {
    return this.history_.get(this.endpoint, undefined, undefined, params);
  }

  map(historyList: HistoryList): History[] {
    return historyList.history;
  }

  getDetailsHref(name: string, namespace?: string): string {
    return this.kdState_.href('replicaset', name, namespace);
  }

  protected getDisplayColumns(): string[] {
    return ['revision', 'name', 'labels', 'created', 'restarted', 'images'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
