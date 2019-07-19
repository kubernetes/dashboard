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
import {ActivatedRoute} from '@angular/router';
import {StatefulSetDetail} from '@api/backendapi';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-stateful-set-detail',
  templateUrl: './template.html',
})
export class StatefulSetDetailComponent implements OnInit, OnDestroy {
  private statefulSetSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.statefulSet, true);
  statefulSet: StatefulSetDetail;
  isInitialized = false;
  podListEndpoint: string;
  eventListEndpoint: string;

  constructor(
    private readonly statefulSet_: NamespacedResourceService<StatefulSetDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const resourceNamespace = this.activatedRoute_.snapshot.params.resourceNamespace;

    this.podListEndpoint = this.endpoint_.child(resourceName, Resource.pod, resourceNamespace);
    this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event, resourceNamespace);

    this.statefulSetSubscription_ = this.statefulSet_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .subscribe((d: StatefulSetDetail) => {
        this.statefulSet = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Stateful Set', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.statefulSetSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }
}
