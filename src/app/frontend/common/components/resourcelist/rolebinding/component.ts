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

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {RoleBinding, RoleBindingList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListBase} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'kd-role-binding-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleBindingListComponent extends ResourceListBase<RoleBindingList, RoleBinding> {
  @Input() endpoint = EndpointManager.resource(Resource.roleBinding).list();

  constructor(
    private readonly roleBinding_: ResourceService<RoleBindingList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super('rolebinding', notifications, cdr);
    this.id = ListIdentifier.roleBinding;
    this.groupId = ListGroupIdentifier.cluster;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<RoleBindingList> {
    return this.roleBinding_.get(this.endpoint, undefined, params);
  }

  map(roleBindingList: RoleBindingList): RoleBinding[] {
    return roleBindingList.items;
  }

  getDisplayColumns(): string[] {
    return ['name', 'created'];
  }
}
