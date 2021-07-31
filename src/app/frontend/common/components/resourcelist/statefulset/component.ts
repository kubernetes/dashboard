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
import {Event, Metric, StatefulSet, StatefulSetList} from '@api/root.api';
import {Observable} from 'rxjs';
import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-stateful-set-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatefulSetListComponent extends ResourceListWithStatuses<StatefulSetList, StatefulSet> {
  @Input() endpoint = EndpointManager.resource(Resource.statefulSet, true).list();
  @Input() showMetrics = false;
  cumulativeMetrics: Metric[];

  constructor(
    private readonly statefulSet_: NamespacedResourceService<StatefulSetList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('statefulset', notifications, cdr);
    this.id = ListIdentifier.statefulSet;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding(
      'kd-success',
      r => r.podInfo.warnings.length === 0 && r.podInfo.pending === 0 && r.podInfo.running === r.podInfo.desired
    );
    this.registerBinding(
      'kd-muted',
      r => r.podInfo.warnings.length === 0 && (r.podInfo.pending > 0 || r.podInfo.running !== r.podInfo.desired),
      Status.Pending
    );
    this.registerBinding('kd-error', r => r.podInfo.warnings.length > 0, Status.Error);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<StatefulSetList> {
    return this.statefulSet_.get(this.endpoint, undefined, undefined, params);
  }

  map(statefulSetList: StatefulSetList): StatefulSet[] {
    this.cumulativeMetrics = statefulSetList.cumulativeMetrics;
    return statefulSetList.statefulSets;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'images', 'labels', 'pods', 'created'];
  }

  hasErrors(statefulSet: StatefulSet): boolean {
    return statefulSet.podInfo.warnings.length > 0;
  }

  getEvents(statefulSet: StatefulSet): Event[] {
    return statefulSet.podInfo.warnings;
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
