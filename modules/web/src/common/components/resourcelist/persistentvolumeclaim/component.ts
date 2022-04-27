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
import {PersistentVolumeClaim, PersistentVolumeClaimList} from 'typings/root.api';

import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-persistent-volume-claim-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersistentVolumeClaimListComponent extends ResourceListWithStatuses<
  PersistentVolumeClaimList,
  PersistentVolumeClaim
> {
  @Input() endpoint = EndpointManager.resource(Resource.persistentVolumeClaim, true).list();

  constructor(
    private readonly persistentVolumeClaim_: NamespacedResourceService<PersistentVolumeClaimList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('persistentvolumeclaim', notifications, cdr);
    this.id = ListIdentifier.persistentVolumeClaim;
    this.groupId = ListGroupIdentifier.config;

    // Register status icon handlers
    this.registerBinding('kd-success', r => r.status === Status.Bound, Status.Bound);
    this.registerBinding('kd-warning', r => r.status === Status.Pending, Status.Pending);
    this.registerBinding('kd-error', r => r.status === Status.Lost, Status.Lost);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<PersistentVolumeClaimList> {
    return this.persistentVolumeClaim_.get(this.endpoint, undefined, undefined, params);
  }

  map(persistentVolumeClaimList: PersistentVolumeClaimList): PersistentVolumeClaim[] {
    return persistentVolumeClaimList.items;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'status', 'volume', 'capacity', 'accmodes', 'storagecl', 'created'];
  }

  getVolumeHref(persistentVolumeName: string): string {
    return this.kdState_.href('persistentvolume', persistentVolumeName);
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
