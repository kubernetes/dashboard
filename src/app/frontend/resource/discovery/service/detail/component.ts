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
import {ServiceDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-service-detail',
  templateUrl: './template.html',
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  private serviceSubscription_: Subscription;
  private serviceName_: string;
  service: ServiceDetail;
  isInitialized = false;
  podListEndpoint: string;
  eventListEndpoint: string;

  constructor(
      private readonly service_: NamespacedResourceService<ServiceDetail>,
      private readonly actionbar_: ActionbarService, private readonly state_: StateService,
      private readonly notifications_: NotificationsService) {}

  ngOnInit(): void {
    this.serviceName_ = this.state_.params.resourceName;
    this.podListEndpoint =
        EndpointManager.resource(Resource.service, true).child(this.serviceName_, Resource.pod);
    this.eventListEndpoint =
        EndpointManager.resource(Resource.service, true).child(this.serviceName_, Resource.event);
    this.serviceSubscription_ =
        this.service_
            .get(EndpointManager.resource(Resource.service, true).detail(), this.serviceName_)
            .startWith({})
            .subscribe((d: ServiceDetail) => {
              this.service = d;
              this.notifications_.pushErrors(d.errors);
              this.actionbar_.onInit.emit(new ResourceMeta('Service', d.objectMeta, d.typeMeta));
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.serviceSubscription_.unsubscribe();
  }
}
