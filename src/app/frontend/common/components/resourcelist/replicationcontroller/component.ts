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
import {Component, ComponentFactoryResolver, Input} from '@angular/core';
import {Event, ReplicationController, ReplicationControllerList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {replicationControllerState} from '../../../../resource/workloads/replicationcontroller/state';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NamespaceService} from '../../../services/global/namespace';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifiers, ListIdentifiers} from '../groupids';

@Component({
  selector: 'kd-replication-controller-list',
  templateUrl: './template.html',
})
export class ReplicationControllerListComponent extends
    ResourceListWithStatuses<ReplicationControllerList, ReplicationController> {
  @Input() endpoint = EndpointManager.resource(Resource.replicationController, true).list();

  constructor(
      state: StateService,
      private readonly replicationController_: NamespacedResourceService<ReplicationControllerList>,
      notifications: NotificationsService, resolver: ComponentFactoryResolver,
      private readonly namespaceService_: NamespaceService) {
    super(replicationControllerState.name, state, notifications, resolver);
    this.id = ListIdentifiers.replicationController;
    this.groupId = ListGroupIdentifiers.workloads;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.timelapse, 'kd-muted', this.isInPendingState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<ReplicationControllerList> {
    return this.replicationController_.get(this.endpoint, undefined, params);
  }

  map(rcList: ReplicationControllerList): ReplicationController[] {
    return rcList.replicationControllers;
  }

  isInErrorState(resource: ReplicationController): boolean {
    return resource.pods.warnings.length > 0;
  }

  isInPendingState(resource: ReplicationController): boolean {
    return resource.pods.warnings.length === 0 && resource.pods.pending > 0;
  }

  isInSuccessState(resource: ReplicationController): boolean {
    return resource.pods.warnings.length === 0 && resource.pods.pending === 0;
  }

  protected getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'age', 'images'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }

  hasErrors(rc: ReplicationController): boolean {
    return rc.pods.warnings.length > 0;
  }

  getEvents(rc: ReplicationController): Event[] {
    return rc.pods.warnings;
  }
}
