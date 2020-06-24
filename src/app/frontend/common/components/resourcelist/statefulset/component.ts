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
import {Event, Metric, StatefulSet, StatefulSetList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';
import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

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
    cdr: ChangeDetectorRef,
  ) {
    super('statefulset', notifications, cdr);
    this.id = ListIdentifier.statefulSet;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.timelapse, 'kd-muted', this.isInPendingState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);

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

  isInErrorState(resource: StatefulSet): boolean {
    return resource.podInfo.warnings.length > 0;
  }

  isInPendingState(resource: StatefulSet): boolean {
    return (
      resource.podInfo.warnings.length === 0 &&
      (resource.podInfo.pending > 0 || resource.podInfo.running !== resource.podInfo.desired)
    );
  }

  isInSuccessState(resource: StatefulSet): boolean {
    return (
      resource.podInfo.warnings.length === 0 &&
      resource.podInfo.pending === 0 &&
      resource.podInfo.running === resource.podInfo.desired
    );
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'created', 'images'];
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
