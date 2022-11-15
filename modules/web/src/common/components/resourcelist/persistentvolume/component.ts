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
import {PersistentVolume, PersistentVolumeList} from '@api/root.api';
import {Observable} from 'rxjs';

import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-persistent-volume-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersistentVolumeListComponent extends ResourceListWithStatuses<PersistentVolumeList, PersistentVolume> {
  @Input() endpoint = EndpointManager.resource(Resource.persistentVolume).list();

  constructor(
    private readonly pv_: ResourceService<PersistentVolumeList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('persistentvolume', notifications, cdr);
    this.id = ListIdentifier.persistentVolume;
    this.groupId = ListGroupIdentifier.cluster;

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register status icon handlers
    this.registerBinding('kd-success', r => r.status === Status.Available, Status.Available);
    this.registerBinding('kd-success', r => r.status === Status.Bound, Status.Bound);
    this.registerBinding('kd-warning', r => r.status === Status.Pending, Status.Pending);
    this.registerBinding('kd-muted', r => r.status === Status.Released, Status.Released);
    this.registerBinding('kd-error', r => r.status === Status.Failed, Status.Failed);
  }

  getResourceObservable(params?: HttpParams): Observable<PersistentVolumeList> {
    return this.pv_.get(this.endpoint, undefined, params);
  }

  map(persistentVolumeList: PersistentVolumeList): PersistentVolume[] {
    return persistentVolumeList.items;
  }

  getClaimHref(claimReference: string): string {
    let href = '';

    const splittedRef = claimReference.split('/');
    if (splittedRef.length === 2) {
      href = this.kdState_.href('persistentvolumeclaim', splittedRef[1], splittedRef[0]);
    }

    return href;
  }

  getDisplayColumns(): string[] {
    return [
      'statusicon',
      'name',
      'capacity',
      'accmodes',
      'reclaimpol',
      'status',
      'claim',
      'storagecl',
      'reason',
      'created',
    ];
  }
}
