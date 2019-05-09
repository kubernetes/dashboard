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

import 'rxjs/add/operator/startWith';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IngressDetail } from '@api/backendapi';
import { StateService } from '@uirouter/core';
import { Subscription } from 'rxjs/Subscription';

import {
  ActionbarService,
  ResourceMeta,
} from '../../../../common/services/global/actionbar';
import { NotificationsService } from '../../../../common/services/global/notifications';
import {
  EndpointManager,
  Resource,
} from '../../../../common/services/resource/endpoint';
import { NamespacedResourceService } from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-ingress-detail',
  templateUrl: './template.html',
})
export class IngressDetailComponent implements OnInit, OnDestroy {
  private ingressSubscription_: Subscription;
  private ingressName_: string;
  ingress: IngressDetail;
  isInitialized = false;

  constructor(
    private readonly ingress_: NamespacedResourceService<IngressDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly state_: StateService,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    this.ingressName_ = this.state_.params.resourceName;
    this.ingressSubscription_ = this.ingress_
      .get(
        EndpointManager.resource(Resource.ingress, true).detail(),
        this.ingressName_
      )
      .startWith({})
      .subscribe((d: IngressDetail) => {
        this.ingress = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(
          new ResourceMeta('Ingress', d.objectMeta, d.typeMeta)
        );
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.ingressSubscription_.unsubscribe();
  }
}
