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
import {IngressRouteDetail} from '@api/root.api';
import {KdStateService} from '@common/services/global/state';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'kd-ingressroute-detail',
  templateUrl: './template.html',
})
export class IngressRouteDetailComponent implements OnInit, OnDestroy {
  ingressroute: IngressRouteDetail;
  isInitialized = false;
  eventListEndpoint: string;
  private readonly endpoint_ = EndpointManager.resource(Resource.ingressroute, true);
  private readonly unsubscribe_ = new Subject<void>();

  constructor(
    private readonly ingressroute_: NamespacedResourceService<IngressRouteDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly kdState_: KdStateService,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const resourceNamespace = this.activatedRoute_.snapshot.params.resourceNamespace;

    //this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event, resourceNamespace);

    this.ingressroute_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((d: IngressRouteDetail) => {
        console.log(d);
        this.ingressroute = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('IngressRoute', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }
  getServiceHref(name: string, namespace: string): string {
    return this.kdState_.href('service', name, namespace);
  }

  extractHostname(host: string): string {
    const matches = Array.from(host.matchAll(/[`"]([^`"]+)[`"]/g));
    const parts = matches.map(match => match[1]);
    return parts.join('');
  }

  isEmptyObject(obj: Object): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
    this.actionbar_.onDetailsLeave.emit();
  }
}
