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
import {Namespace, NamespaceList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-namespace-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NamespaceListComponent extends ResourceListWithStatuses<NamespaceList, Namespace> {
  @Input() endpoint = EndpointManager.resource(Resource.namespace).list();

  constructor(
    private readonly namespace_: ResourceService<NamespaceList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super('namespace', notifications, cdr);
    this.id = ListIdentifier.namespace;
    this.groupId = ListGroupIdentifier.cluster;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<NamespaceList> {
    return this.namespace_.get(this.endpoint, undefined, params);
  }

  map(namespaceList: NamespaceList): Namespace[] {
    return namespaceList.namespaces;
  }

  isInErrorState(resource: Namespace): boolean {
    return resource.phase === 'Terminating';
  }

  isInSuccessState(resource: Namespace): boolean {
    return resource.phase === 'Active';
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'phase', 'created'];
  }
}
