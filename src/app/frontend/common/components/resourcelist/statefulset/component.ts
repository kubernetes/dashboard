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
import {Event, Pod, StatefulSet, StatefulSetList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifiers, ListIdentifiers} from '../groupids';

@Component({
  selector: 'kd-stateful-set-list',
  templateUrl: './template.html',
})
export class StatefulSetListComponent extends
    ResourceListWithStatuses<StatefulSetList, StatefulSet> {
  @Input() endpoint = EndpointManager.resource(Resource.statefulSet, true).list();

  constructor(
      state: StateService,
      private readonly statefulSet_: NamespacedResourceService<StatefulSetList>,
      resolver: ComponentFactoryResolver, notifications: NotificationsService) {
    super('', state, notifications, resolver);
    this.id = ListIdentifiers.statefulSet;
    this.groupId = ListGroupIdentifiers.workloads;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.timelapse, 'kd-muted', this.isInPendingState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);
  }

  getResourceObservable(params?: HttpParams): Observable<StatefulSetList> {
    return this.statefulSet_.get(this.endpoint, undefined, params);
  }

  map(statefulSetList: StatefulSetList): StatefulSet[] {
    return statefulSetList.statefulSets;
  }

  isInErrorState(resource: StatefulSet): boolean {
    return resource.pods.warnings.length > 0;
  }

  isInPendingState(resource: StatefulSet): boolean {
    return resource.pods.warnings.length === 0 && resource.pods.pending > 0;
  }

  isInSuccessState(resource: StatefulSet): boolean {
    return resource.pods.warnings.length === 0 && resource.pods.pending === 0;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'age', 'images'];
  }

  hasErrors(statefulSet: StatefulSet): boolean {
    return statefulSet.pods.warnings.length > 0;
  }

  getEvents(statefulSet: StatefulSet): Event[] {
    return statefulSet.pods.warnings;
  }
}
