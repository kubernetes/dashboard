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
import {ClusterRoleBindingDetail} from '@api/root.api';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {KdStateService} from '@common/services/global/state';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'kd-cluster-role-binding-detail',
  templateUrl: './template.html',
})
export class ClusterRoleBindingDetailComponent implements OnInit, OnDestroy {
  private _unsubscribe = new Subject<void>();
  private clusterRoleSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.clusterRoleBinding);
  clusterRoleBinding: ClusterRoleBindingDetail;
  isInitialized = false;

  constructor(
    private readonly clusterRoleBinding_: ResourceService<ClusterRoleBindingDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly route_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
    private readonly kdState_: KdStateService
  ) {}

  ngOnInit(): void {
    const resourceName = this.route_.snapshot.params.resourceName;

    this.clusterRoleSubscription_ = this.clusterRoleBinding_
      .get(this.endpoint_.detail(), resourceName)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((d: ClusterRoleBindingDetail) => {
        this.clusterRoleBinding = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Cluster Role Binding', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
    this.actionbar_.onDetailsLeave.emit();
  }

  getRoleHref(): string {
    return this.kdState_.href(
      this.clusterRoleBinding.roleRef.kind.toLowerCase(),
      this.clusterRoleBinding.roleRef.name,
      this.clusterRoleBinding.objectMeta.namespace
    );
  }
}
