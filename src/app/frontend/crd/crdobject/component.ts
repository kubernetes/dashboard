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
import {CRDObjectDetail} from '@api/backendapi';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ActionbarService, ResourceMeta} from '../../common/services/global/actionbar';
import {NamespacedResourceService} from '../../common/services/resource/resource';
import {EndpointManager, Resource} from '../../common/services/resource/endpoint';
import {NotificationsService} from '../../common/services/global/notifications';

@Component({selector: 'kd-crd-object-detail', templateUrl: './template.html'})
export class CRDObjectDetailComponent implements OnInit, OnDestroy {
  private objectSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.crd, true);
  object: CRDObjectDetail;
  isInitialized = false;

  constructor(
    private readonly object_: NamespacedResourceService<CRDObjectDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const {crdName, namespace, objectName} = this.activatedRoute_.snapshot.params;
    this.objectSubscription_ = this.object_
      .get(this.endpoint_.child(crdName, objectName, namespace))
      .subscribe((d: CRDObjectDetail) => {
        this.object = d;
        this.notifications_.pushErrors(d.errors);
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.objectSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }
}
