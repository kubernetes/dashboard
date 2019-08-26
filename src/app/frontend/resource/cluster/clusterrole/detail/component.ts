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
import {ClusterRoleDetail} from '@api/backendapi';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {ResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-cluster-role-detail',
  templateUrl: './template.html',
})
export class ClusterRoleDetailComponent implements OnInit, OnDestroy {
  private clusterRoleSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.clusterRole);
  clusterRole: ClusterRoleDetail;
  isInitialized = false;

  constructor(
    private readonly clusterRole_: ResourceService<ClusterRoleDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly route_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const resourceName = this.route_.snapshot.params.resourceName;

    this.clusterRoleSubscription_ = this.clusterRole_
      .get(this.endpoint_.detail(), resourceName)
      .subscribe((d: ClusterRoleDetail) => {
        this.clusterRole = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Cluster Role', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.clusterRoleSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }
}
