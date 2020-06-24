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
import {Event, ReplicationController, ReplicationControllerList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-replication-controller-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplicationControllerListComponent extends ResourceListWithStatuses<
  ReplicationControllerList,
  ReplicationController
> {
  @Input() endpoint = EndpointManager.resource(Resource.replicationController, true).list();

  constructor(
    private readonly replicationController_: NamespacedResourceService<ReplicationControllerList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super('replicationcontroller', notifications, cdr);
    this.id = ListIdentifier.replicationController;
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

  getResourceObservable(params?: HttpParams): Observable<ReplicationControllerList> {
    return this.replicationController_.get(this.endpoint, undefined, undefined, params);
  }

  map(rcList: ReplicationControllerList): ReplicationController[] {
    return rcList.replicationControllers;
  }

  isInErrorState(resource: ReplicationController): boolean {
    return resource.podInfo.warnings.length > 0;
  }

  isInPendingState(resource: ReplicationController): boolean {
    return resource.podInfo.warnings.length === 0 && resource.podInfo.pending > 0;
  }

  isInSuccessState(resource: ReplicationController): boolean {
    return resource.podInfo.warnings.length === 0 && resource.podInfo.pending === 0;
  }

  protected getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'created', 'images'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }

  hasErrors(rc: ReplicationController): boolean {
    return rc.podInfo.warnings.length > 0;
  }

  getEvents(rc: ReplicationController): Event[] {
    return rc.podInfo.warnings;
  }
}
