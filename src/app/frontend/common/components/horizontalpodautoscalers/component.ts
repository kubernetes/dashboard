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
import {Component, ComponentFactoryResolver, Input} from '@angular/core';
import {HorizontalPodAutoscaler, HorizontalPodAutoscalerList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';

import {deploymentState} from '../../../resource/workloads/deployment/state';
import {ResourceListBase} from '../../resources/list';
import {NamespaceService} from '../../services/global/namespace';
import {NotificationsService} from '../../services/global/notifications';
import {EndpointManager, Resource} from '../../services/resource/endpoint';
import {NamespacedResourceService} from '../../services/resource/resource';
import {ResourceService} from '../../services/resource/resource';
import {MenuComponent} from '../list/column/menu/component';
import {ListGroupIdentifiers, ListIdentifiers} from '../resourcelist/groupids';

@Component({
  selector: 'kd-horizontalpodautoscalers-list',
  templateUrl: './template.html',
})

export class HorizontalPodAutoscalerListComponent extends
    ResourceListBase<HorizontalPodAutoscalerList, HorizontalPodAutoscaler> {
  @Input() endpoint = EndpointManager.resource(Resource.horizontalpodautoscaler, true).list();

  constructor(
      state: StateService,
      private readonly horizontalpodautoscalerList: ResourceService<HorizontalPodAutoscalerList>,
      notifications: NotificationsService) {
    super(deploymentState.name, state, notifications);
    this.id = ListIdentifiers.horizontalPodAutoScaler;
    this.groupId = ListGroupIdentifiers.workloads;

    this.registerActionColumn<MenuComponent>('menu', MenuComponent);
  }

  getResourceObservable(params?: HttpParams): Observable<HorizontalPodAutoscalerList> {
    return this.horizontalpodautoscalerList.get(this.endpoint, undefined, params);
  }

  map(horizontalpodautoscalerList: HorizontalPodAutoscalerList): HorizontalPodAutoscaler[] {
    return horizontalpodautoscalerList.horizontalpodautoscalers;
  }

  getDisplayColumns(): string[] {
    return [
      'name', 'namespace', 'creationTimestamp', 'minReplicas', 'maxReplicas',
      'currentCPUUtilizationPercentage', 'targetCPUUtilizationPercentage'
    ];
  }
}
