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
import {ClusterRole, ClusterRoleList} from '@api/root.api';
import {Observable} from 'rxjs';

import {ResourceListBase} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-cluster-role-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClusterRoleListComponent extends ResourceListBase<ClusterRoleList, ClusterRole> {
  @Input() endpoint = EndpointManager.resource(Resource.clusterRole).list();

  constructor(
    private readonly clusterRole_: ResourceService<ClusterRoleList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('clusterrole', notifications, cdr);
    this.id = ListIdentifier.clusterRole;
    this.groupId = ListGroupIdentifier.cluster;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<ClusterRoleList> {
    return this.clusterRole_.get(this.endpoint, undefined, params);
  }

  map(clusterRoleList: ClusterRoleList): ClusterRole[] {
    return clusterRoleList.items;
  }

  getDisplayColumns(): string[] {
    return ['name', 'created'];
  }
}
