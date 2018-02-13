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
import {Component} from '@angular/core';
import {ReplicaSet, ReplicaSetList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {ResourceListWithStatuses} from '../../../../common/resources/list';
import {NamespacedResourceListService} from '../../../../common/services/resource/resourcelist';

@Component(
    {selector: 'kd-replica-set-list', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class ReplicaSetListComponent extends ResourceListWithStatuses<ReplicaSetList, ReplicaSet> {
  constructor(
      state: StateService,
      private readonly replicaSetListService_: NamespacedResourceListService<ReplicaSetList>) {
    super('pod', state);
  }

  getResourceObservable(params?: HttpParams): Observable<ReplicaSetList> {
    return this.replicaSetListService_.get(params);
  }

  map(rsList: ReplicaSetList): ReplicaSet[] {
    return rsList.replicaSets;
  }

  isInErrorState(resource: ReplicaSet): boolean {
    return resource.pods.warnings.length > 0;
  }

  isInWarningState(resource: ReplicaSet): boolean {
    return !this.isInErrorState(resource) && resource.pods.pending > 0;
  }

  isInSuccessState(resource: ReplicaSet): boolean {
    return !this.isInErrorState(resource) && !this.isInWarningState(resource);
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'pods', 'age', 'images'];
  }
}
