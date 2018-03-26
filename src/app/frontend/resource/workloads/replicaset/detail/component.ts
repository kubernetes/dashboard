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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {EnvVar, PodDetail, ReplicaSetDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {KdStateService} from '../../../../common/services/global/state';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';
import {nodeState} from '../../../cluster/node/state';

@Component({
  selector: 'kd-replica-set-detail',
  templateUrl: './template.html',
})
export class ReplicaSetDetailComponent implements OnInit, OnDestroy {
  private replicaSetSubscription_: Subscription;
  private name_: string;
  replicaSet: ReplicaSetDetail;
  isInitialized = false;
  eventListEndpoint: string;
  podListEndpoint: string;
  serviceListEndpoint: string;

  constructor(
      private readonly replicaSet_: NamespacedResourceService<ReplicaSetDetail>,
      private readonly actionbar_: ActionbarService, private readonly state_: StateService,
      private readonly notifications_: NotificationsService) {}

  ngOnInit(): void {
    this.name_ = this.state_.params.resourceName;
    this.eventListEndpoint =
        EndpointManager.resource(Resource.replicaSet, true).child(this.name_, Resource.event);
    this.podListEndpoint =
        EndpointManager.resource(Resource.replicaSet, true).child(this.name_, Resource.pod);
    this.serviceListEndpoint =
        EndpointManager.resource(Resource.replicaSet, true).child(this.name_, Resource.service);

    this.replicaSetSubscription_ =
        this.replicaSet_
            .get(EndpointManager.resource(Resource.replicaSet, true).detail(), this.name_)
            .startWith({})
            .subscribe((d: ReplicaSetDetail) => {
              this.replicaSet = d;
              this.notifications_.pushErrors(d.errors);
              this.actionbar_.onInit.emit(
                  new ResourceMeta('Replica Set', d.objectMeta, d.typeMeta));
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.replicaSetSubscription_.unsubscribe();
  }
}
