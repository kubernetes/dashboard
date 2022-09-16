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
import {Event, Metric, Pod, PodList} from '@api/root.api';
import {Observable} from 'rxjs';
import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-pod-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodListComponent extends ResourceListWithStatuses<PodList, Pod> {
  @Input() endpoint = EndpointManager.resource(Resource.pod, true).list();
  @Input() showMetrics = false;
  cumulativeMetrics: Metric[];

  constructor(
    private readonly podList: NamespacedResourceService<PodList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('pod', notifications, cdr);
    this.id = ListIdentifier.pod;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding('kd-success', r => r.status === Status.Running, Status.Running);
    this.registerBinding('kd-success', r => r.status === Status.Succeeded, Status.Succeeded);
    this.registerBinding('kd-success', r => r.status === Status.Completed, Status.Completed);
    this.registerBinding('kd-warning', r => r.status === Status.Pending, Status.Pending);
    this.registerBinding('kd-warning', r => r.status === Status.ContainerCreating, Status.ContainerCreating);
    this.registerBinding('kd-muted', r => r.status === Status.Terminating, Status.Terminating);
    this.registerBinding('kd-error', this.isInErrorState, 'Error');

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<PodList> {
    return this.podList.get(this.endpoint, undefined, undefined, params);
  }

  map(podList: PodList): Pod[] {
    this.cumulativeMetrics = podList.cumulativeMetrics;
    return podList.pods;
  }

  isInErrorState(resource: Pod): boolean {
    return (
      [Status.Failed, Status.Error].some(s => resource.status === s) ||
      (resource.warnings.length > 0 &&
        ![Status.Pending, Status.NotReady, Status.Terminating, Status.Unknown, Status.ContainerCreating].some(
          s => resource.status === s
        ))
    );
  }

  hasErrors(pod: Pod): boolean {
    return pod.warnings.length > 0;
  }

  getEvents(pod: Pod): Event[] {
    return pod.warnings;
  }

  getDisplayStatus(pod: Pod): string {
    return pod.status;
  }

  protected getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'images', 'labels', 'node', 'status', 'restarts', 'cpu', 'mem', 'created'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
