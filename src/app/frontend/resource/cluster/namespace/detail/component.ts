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
import {NamespaceDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {ResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-namespace-detail',
  templateUrl: './template.html',
})
export class NamespaceDetailComponent implements OnInit, OnDestroy {
  private namespaceSubscription_: Subscription;
  private namespaceName_: string;
  namespace: NamespaceDetail;
  isInitialized = false;
  eventListEndpoint: string;

  constructor(
      private readonly namespace_: ResourceService<NamespaceDetail>,
      private readonly state_: StateService) {}

  ngOnInit(): void {
    this.namespaceName_ = this.state_.params.resourceName;
    this.eventListEndpoint = EndpointManager.resource(Resource.namespace, false)
                                 .child(this.namespaceName_, Resource.event);

    this.namespaceSubscription_ =
        this.namespace_
            .get(EndpointManager.resource(Resource.namespace).detail(), this.namespaceName_)
            .subscribe((d: NamespaceDetail) => {
              this.namespace = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.namespaceSubscription_.unsubscribe();
  }
}
