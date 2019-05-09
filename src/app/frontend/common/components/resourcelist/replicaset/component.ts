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

import { HttpParams } from '@angular/common/http';
import { Component, ComponentFactoryResolver, Input } from '@angular/core';
import { Event, ReplicaSet, ReplicaSetList } from '@api/backendapi';
import { StateService } from '@uirouter/core';
import { Observable } from 'rxjs/Observable';
import { replicaSetState } from '../../../../resource/workloads/replicaset/state';

import { ResourceListWithStatuses } from '../../../resources/list';
import { NamespaceService } from '../../../services/global/namespace';
import { NotificationsService } from '../../../services/global/notifications';
import { EndpointManager, Resource } from '../../../services/resource/endpoint';
import { NamespacedResourceService } from '../../../services/resource/resource';
import { MenuComponent } from '../../list/column/menu/component';
import { ListGroupIdentifiers, ListIdentifiers } from '../groupids';

@Component({
  selector: 'kd-replica-set-list',
  templateUrl: './template.html',
})
export class ReplicaSetListComponent extends ResourceListWithStatuses<
  ReplicaSetList,
  ReplicaSet
> {
  @Input() title: string;
  @Input() endpoint = EndpointManager.resource(
    Resource.replicaSet,
    true
  ).list();

  constructor(
    state: StateService,
    private readonly replicaSet_: NamespacedResourceService<ReplicaSetList>,
    notifications: NotificationsService,
    resolver: ComponentFactoryResolver,
    private readonly namespaceService_: NamespaceService
  ) {
    super(replicaSetState.name, state, notifications, resolver);
    this.id = ListIdentifiers.replicaSet;
    this.groupId = ListGroupIdentifiers.workloads;

    // Register status icon handlers
    this.registerBinding(
      this.icon.checkCircle,
      'kd-success',
      this.isInSuccessState
    );
    this.registerBinding(
      this.icon.timelapse,
      'kd-muted',
      this.isInPendingState
    );
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn(
      'namespace',
      'name',
      this.shouldShowNamespaceColumn_.bind(this)
    );
  }

  getResourceObservable(params?: HttpParams): Observable<ReplicaSetList> {
    return this.replicaSet_.get(this.endpoint, undefined, params);
  }

  map(rsList: ReplicaSetList): ReplicaSet[] {
    return rsList.replicaSets;
  }

  isInErrorState(resource: ReplicaSet): boolean {
    return resource.podInfo.warnings.length > 0;
  }

  isInPendingState(resource: ReplicaSet): boolean {
    return (
      resource.podInfo.warnings.length === 0 && resource.podInfo.pending > 0
    );
  }

  isInSuccessState(resource: ReplicaSet): boolean {
    return (
      resource.podInfo.warnings.length === 0 && resource.podInfo.pending === 0
    );
  }

  protected getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'age', 'images'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }

  hasErrors(replicaSet: ReplicaSet): boolean {
    return replicaSet.podInfo.warnings.length > 0;
  }

  getEvents(replicaSet: ReplicaSet): Event[] {
    return replicaSet.podInfo.warnings;
  }
}
