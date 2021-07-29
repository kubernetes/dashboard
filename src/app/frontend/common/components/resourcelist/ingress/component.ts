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
import {Observable} from 'rxjs';
import {Ingress, IngressList} from 'typings/root.api';

import {ResourceListBase} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-ingress-list',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngressListComponent extends ResourceListBase<IngressList, Ingress> {
  @Input() endpoint = EndpointManager.resource(Resource.ingress, true).list();

  constructor(
    private readonly ingress_: NamespacedResourceService<IngressList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('ingress', notifications, cdr);
    this.id = ListIdentifier.ingress;
    this.groupId = ListGroupIdentifier.discovery;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<IngressList> {
    return this.ingress_.get(this.endpoint, undefined, undefined, params);
  }

  map(ingressList: IngressList): Ingress[] {
    return ingressList.items;
  }

  getDisplayColumns(): string[] {
    return ['name', 'labels', 'endpoints', 'hosts', 'created'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
