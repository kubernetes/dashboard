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
import {Observable} from 'rxjs/Observable';
import {OpaDetail, OpaList} from 'typings/backendapi';
import {ResourceListBase} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {OpaService} from '../../../services/global/opa';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Injectable} from '@angular/core';

@Component({
  selector: 'kd-config-map-opa-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable()
export class ConfigMapOPAListComponent extends ResourceListBase<OpaList, OpaDetail> {
  page: number;
  opaList: OpaList;
  constructor(
    public opaRules: OpaService,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super('configmap', notifications, cdr);
    this.id = ListIdentifier.configMap;
    this.groupId = ListGroupIdentifier.config;
  }

  getResourceObservable(params?: HttpParams): Observable<OpaList> {
    this.page = params['map'].get('page')[0];
    return this.opaRules.getConfig();
  }

  map(opaList: OpaList): OpaDetail[] {
    this.totalItems = opaList.items.length;
    //this.opaList = opaList
    opaList.listMeta.totalItems = this.totalItems;
    return opaList.items;
  }

  getDisplayColumns(): string[] {
    return ['kind', 'champ', 'contrainte'];
  }

  pagination(opaDet: OpaDetail[]): OpaDetail[] {
    const start = this.itemsPerPage * (this.page - 1);
    //var cloneArray = opaDet.slice();
    if (opaDet.length - start > this.itemsPerPage) {
      return opaDet.slice(start, start + this.itemsPerPage - 1);
    } else {
      return opaDet.slice(start, start + this.itemsPerPage - 1);
    }
  }
}
