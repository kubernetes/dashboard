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
import {CRD, CRDList} from '@api/root.api';
import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {Observable} from 'rxjs';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-crd-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CRDListComponent extends ResourceListWithStatuses<CRDList, CRD> {
  @Input() endpoint = EndpointManager.resource(Resource.crd).list();

  constructor(
    private readonly crd_: ResourceService<CRDList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super(Resource.crdFull, notifications, cdr);
    this.id = ListIdentifier.crd;
    this.groupId = ListGroupIdentifier.none;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register status icon handlers
    this.registerBinding('kd-success', r => r.established === 'True', 'Established');
    this.registerBinding('kd-muted', r => r.established === 'Unknown', 'Unknown');
    this.registerBinding('kd-error', r => r.established === 'False', 'Not established');
  }

  isNamespaced(crd: CRD): string {
    return crd.scope === 'Namespaced' ? 'True' : 'False';
  }

  getResourceObservable(params?: HttpParams): Observable<CRDList> {
    return this.crd_.get(this.endpoint, undefined, params);
  }

  map(crdList: CRDList): CRD[] {
    return crdList.items;
  }

  getDisplayName(name: string): string {
    return name.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'group', 'fullName', 'namespaced', 'created'];
  }
}
