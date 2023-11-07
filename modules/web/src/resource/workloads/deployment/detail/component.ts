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

import {Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DeploymentDetail, ReplicaSet} from '@api/root.api';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {KdStateService} from '@common/services/global/state';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'kd-deployment-detail',
  templateUrl: './template.html',
})
export class DeploymentDetailComponent implements OnInit, OnDestroy {
  private readonly endpoint_ = EndpointManager.resource(Resource.deployment, true);
  deployment: DeploymentDetail;
  newReplicaSet: ReplicaSet;
  isInitialized = false;
  eventListEndpoint: string;
  oldReplicaSetsEndpoint: string;
  newReplicaSetEndpoint: string;
  horizontalPodAutoscalerEndpoint: string;

  private destroyRef = inject(DestroyRef);
  constructor(
    private readonly deployment_: NamespacedResourceService<DeploymentDetail>,
    private readonly replicaSet_: NamespacedResourceService<ReplicaSet>,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly actionbar_: ActionbarService,
    private readonly kdState_: KdStateService,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const resourceNamespace = this.activatedRoute_.snapshot.params.resourceNamespace;

    this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event, resourceNamespace);
    this.oldReplicaSetsEndpoint = this.endpoint_.child(resourceName, Resource.oldReplicaSet, resourceNamespace);
    this.newReplicaSetEndpoint = this.endpoint_.child(resourceName, Resource.newReplicaSet, resourceNamespace);
    this.horizontalPodAutoscalerEndpoint = this.endpoint_.child(
      resourceName,
      Resource.horizontalPodAutoscaler,
      resourceNamespace
    );

    this.deployment_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((d: DeploymentDetail) => {
        this.deployment = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Deployment', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });

    this.replicaSet_
      .get(this.newReplicaSetEndpoint)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rs: ReplicaSet) => {
        this.newReplicaSet = rs;
      });
  }

  getNewReplicaSetHref(): string {
    return this.kdState_.href(
      this.newReplicaSet.typeMeta.kind,
      this.newReplicaSet.objectMeta.name,
      this.newReplicaSet.objectMeta.namespace
    );
  }

  ngOnDestroy(): void {
    this.actionbar_.onDetailsLeave.emit();
  }
}
