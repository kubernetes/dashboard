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
import {RoleBindingDetail} from '@api/root.api';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {KdStateService} from '@common/services/global/state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'kd-role-detail',
  templateUrl: './template.html',
})
export class RoleBingingDetailComponent implements OnInit, OnDestroy {
  private _unsubscribe = new Subject<void>();
  private readonly endpoint_ = EndpointManager.resource(Resource.roleBinding, true);
  roleBinding: RoleBindingDetail;
  isInitialized = false;

  constructor(
    private readonly roleBinding_: NamespacedResourceService<RoleBindingDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly route_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
    private readonly kdState_: KdStateService
  ) {}

  ngOnInit(): void {
    const resourceName = this.route_.snapshot.params.resourceName;
    const resourceNamespace = this.route_.snapshot.params.resourceNamespace;

    this.roleBinding_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((d: RoleBindingDetail) => {
        this.roleBinding = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Role Binding', d.objectMeta, d.typeMeta));
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
      this.roleBinding.roleRef.kind.toLowerCase(),
      this.roleBinding.roleRef.name,
      this.roleBinding.objectMeta.namespace
    );
  }
}
