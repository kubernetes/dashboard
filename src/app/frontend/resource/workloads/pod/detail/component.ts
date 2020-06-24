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
import {Container, PodDetail} from '@api/backendapi';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {KdStateService} from '../../../../common/services/global/state';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-pod-detail',
  templateUrl: './template.html',
})
export class PodDetailComponent implements OnInit, OnDestroy {
  private podSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.pod, true);
  pod: PodDetail;
  isInitialized = false;
  eventListEndpoint: string;
  pvcListEndpoint: string;

  constructor(
    private readonly pod_: NamespacedResourceService<PodDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly kdState_: KdStateService,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const resourceNamespace = this.activatedRoute_.snapshot.params.resourceNamespace;

    this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event, resourceNamespace);
    this.pvcListEndpoint = this.endpoint_.child(resourceName, Resource.persistentVolumeClaim, resourceNamespace);

    this.podSubscription_ = this.pod_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .subscribe((d: PodDetail) => {
        this.pod = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Pod', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.podSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }

  getNodeHref(name: string): string {
    return this.kdState_.href('node', name);
  }

  getContainerName(_: number, container: Container): string {
    return container.name;
  }
}
