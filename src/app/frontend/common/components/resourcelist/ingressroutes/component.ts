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
import {ActivatedRoute} from '@angular/router';
import {CRDObject, CRDObjectList} from '@api/backendapi';
import {Observable} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ResourceListBase} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

@Component({
  selector: 'kd-ingressroute-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngressRouteListComponent extends ResourceListBase<CRDObjectList, CRDObject> {
  @Input() endpoint;
  objectType: string;

  constructor(
    private readonly crdObject_: NamespacedResourceService<CRDObjectList>,
    private readonly activatedRoute_: ActivatedRoute,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super(
      activatedRoute_.params.pipe(map(params => `customresourcedefinition/${params.crdName}`)),
      notifications,
      cdr,
    );
    this.id = ListIdentifier.crdObject;
    this.groupId = ListGroupIdentifier.none;
    const url = activatedRoute_.snapshot['_routerState']['url'];
    this.objectType = url.split(';')[0].split('/')[1];

    this.endpoint = EndpointManager.resource(Resource.crd, true).traefik(this.objectType);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<CRDObjectList> {
    return this.crdObject_.get(this.endpoint, undefined, undefined, params);
  }

  map(crdObjectList: CRDObjectList): any[] {
    const ingressrouteList = [];
    crdObjectList.items.forEach(item => {
      const json = JSON.parse(
        item.objectMeta.annotations['kubectl.kubernetes.io/last-applied-configuration'],
      );
      item.objectMeta['traefik'] = json;
      ingressrouteList.push(item);
    });
    return ingressrouteList;
  }

  getDisplayColumns(): string[] {
    return ['namespace', 'name', 'host', 'service', 'port', 'entrypoint'];
  }
}
