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
import {CRDObject, CRDObjectList} from '@api/root.api';
import {Observable} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ResourceListBase} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {defaultThrottleConfig} from 'rxjs/internal-compatibility';

@Component({
  selector: 'kd-ingressroute-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngressRouteListComponent extends ResourceListBase<CRDObjectList, CRDObject> {
  @Input() endpoint;
  objectType: string;
  objectName: string;
  hcpurl = 'http://eahcp.org/index.php/about_eahcp/covered_species';
  errorSpec = {
    entryPoints: ['Erreur de format'],
    routes: [{match: 'Erreur de format', services: [{name: 'Erreur de format', port: 0}]}],
  };
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
    switch (this.objectType) {
      case 'ingressroutes':
        this.objectName = 'IngressRoutes';
        break;
      case 'ingressroutetcps':
        this.objectName = 'IngressRouteTCPs';
        break;
      default:
        this.objectName = this.objectType;
    }
    this.endpoint = EndpointManager.resource(Resource.crd, true).traefik(this.objectType);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<CRDObjectList> {
    return this.crdObject_.get(this.endpoint, undefined, undefined, params);
  }


  linkModelFunc(url:string): void{
    window.open(url);
  }
  map(crdObjectList: CRDObjectList): any[] {
    if (crdObjectList.items) {
      this.totalItems = crdObjectList.items.length;
      
      crdObjectList.items.forEach(item => {
        let splittedMatch = ['','','','']
        if (
          !item.spec.routes ||
          !item.spec.routes[0] ||
          !item.spec.routes[0].match ||
          !item.spec.routes[0].services ||
          !item.spec.routes[0].services[0] ||
          !item.spec.routes[0].services[0].name ||
          !item.spec.routes[0].services[0].port
        ) {
          item['iconName'] = 'error';
          item['iconClass'] = {'kd-success': false};
          item.spec = this.errorSpec;
          splittedMatch[0] = item.spec.routes[0].match
        } else {
          item['iconName'] = 'check_circle';
          item['iconClass'] = {'kd-success': true};
          splittedMatch = this.splitHostUrl(item.spec.routes[0].match)
        }
        item.spec['splitUrl'] = splittedMatch
      });
      return crdObjectList.items;
    } else {
      return null;
    }
  }

  splitHostUrl(fullUrl: string): string[]{
    let cut;
    let guimet;
    if(fullUrl.split('\'').length>fullUrl.split('\`').length){
      cut = fullUrl.split('\'')
      guimet = '\''
    }else{
      cut = fullUrl.split('\`')
      guimet = '\`'
    }

    if(cut.length === 3){
      return [cut[0]+guimet,cut[1],guimet+cut[2], 'https://'+cut[1]]
    }else if(cut.length === 5){
      return [cut[0]+guimet,cut[1],guimet+cut[2]+guimet+cut[3]+guimet+cut[4], 'https://'+cut[1] + cut[3]]
    }else{
      return [fullUrl,'','','']
    }
  } 

  getDisplayColumns(): string[] {
    return ['statusicon', 'title', 'host', 'service', 'port', 'entrypoint', 'created'];
  }
}
