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
import {Component, Input} from '@angular/core';
import {PersistentVolume, PersistentVolumeList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';

import {persistentVolumeState} from '../../../../resource/cluster/persistentvolume/state';
import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifiers, ListIdentifiers} from '../groupids';

@Component({
  selector: 'kd-persistent-volume-list',
  templateUrl: './template.html',
})
export class PersistentVolumeListComponent extends
    ResourceListWithStatuses<PersistentVolumeList, PersistentVolume> {
  @Input() endpoint = EndpointManager.resource(Resource.persistentVolume).list();

  constructor(
      state: StateService, private readonly pv_: ResourceService<PersistentVolumeList>,
      notifications: NotificationsService) {
    super(persistentVolumeState.name, state, notifications);
    this.id = ListIdentifiers.persistentVolume;
    this.groupId = ListGroupIdentifiers.cluster;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.help, 'kd-muted', this.isInPendingState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);
  }

  getResourceObservable(params?: HttpParams): Observable<PersistentVolumeList> {
    return this.pv_.get(this.endpoint, undefined, params);
  }

  map(persistentVolumeList: PersistentVolumeList): PersistentVolume[] {
    return persistentVolumeList.items;
  }

  isInErrorState(resource: PersistentVolume): boolean {
    return resource.status === 'Failed';
  }

  isInPendingState(resource: PersistentVolume): boolean {
    return resource.status === 'Pending' || resource.status === 'Released';
  }

  isInSuccessState(resource: PersistentVolume): boolean {
    return resource.status === 'Available' || resource.status === 'Bound';
  }

  getDisplayColumns(): string[] {
    return [
      'statusicon', 'name', 'capacity', 'accmodes', 'reclaimpol', 'status', 'claim', 'storagecl',
      'reason', 'age'
    ];
  }
}
