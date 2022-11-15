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
import {Service, ServiceList} from 'typings/root.api';

import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status, StatusClass} from '../statuses';

@Component({
  selector: 'kd-service-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListComponent extends ResourceListWithStatuses<ServiceList, Service> {
  @Input() endpoint = EndpointManager.resource(Resource.service, true).list();

  constructor(
    private readonly service_: NamespacedResourceService<ServiceList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('service', notifications, cdr);
    this.id = ListIdentifier.service;
    this.groupId = ListGroupIdentifier.discovery;

    // Register status icon handlers
    this.registerBinding(StatusClass.Success, r => this.isInSuccessState(r), Status.Success);
    this.registerBinding(StatusClass.Warning, r => !this.isInSuccessState(r), Status.Pending);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<ServiceList> {
    return this.service_.get(this.endpoint, undefined, undefined, params);
  }

  map(serviceList: ServiceList): Service[] {
    return serviceList.services;
  }

  /**
   * Success state of a Service depends on the type of service
   * https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
   * ClusterIP:     ClusterIP is defined
   * NodePort:      ClusterIP is defined
   * LoadBalancer:  ClusterIP is defined __and__ external endpoints exist
   * ExternalName:  true
   */
  isInSuccessState(resource: Service): boolean {
    switch (resource.type) {
      case 'ExternalName':
        return true;
      case 'LoadBalancer':
        if (resource.externalEndpoints.length === 0) {
          return false;
        }
        break;
      case 'ClusterIP':
      case 'NodePort':
      default:
        break;
    }
    return resource.clusterIP.length > 0;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'type', 'clusterip', 'internalendp', 'externalendp', 'created'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
