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
import {StatefulSetDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {KdStateService} from '../../../../common/services/global/state';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-stateful-set-detail',
  templateUrl: './template.html',
})
export class StatefulSetDetailComponent implements OnInit, OnDestroy {
  private statefulSetSubscription_: Subscription;
  private statefulSetName_: string;
  statefulSet: StatefulSetDetail;
  isInitialized = false;
  podListEndpoint: string;
  eventListEndpoint: string;

  constructor(
      private readonly statefulSet_: NamespacedResourceService<StatefulSetDetail>,
      private readonly actionbar_: ActionbarService, private readonly state_: StateService,
      private readonly notifications_: NotificationsService) {}

  ngOnInit(): void {
    this.statefulSetName_ = this.state_.params.resourceName;
    this.podListEndpoint = EndpointManager.resource(Resource.statefulSet, true)
                               .child(this.statefulSetName_, Resource.pod);
    this.eventListEndpoint = EndpointManager.resource(Resource.statefulSet, true)
                                 .child(this.statefulSetName_, Resource.event);
    this.statefulSetSubscription_ =
        this.statefulSet_
            .get(
                EndpointManager.resource(Resource.statefulSet, true).detail(),
                this.statefulSetName_)
            .startWith({})
            .subscribe((d: StatefulSetDetail) => {
              this.statefulSet = d;
              this.notifications_.pushErrors(d.errors);
              this.actionbar_.onInit.emit(
                  new ResourceMeta('Stateful Set', d.objectMeta, d.typeMeta));
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.statefulSetSubscription_.unsubscribe();
  }
}
