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
import {DeploymentDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';
import {KdStateService} from '../../../../common/services/global/state';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-deployment-detail',
  templateUrl: './template.html',
})
export class DeploymentDetailComponent implements OnInit, OnDestroy {
  private deploymentSubscription_: Subscription;
  private deploymentName_: string;
  deployment: DeploymentDetail;
  isInitialized = false;
  eventListEndpoint: string;
  oldReplicaSetsEndpoint: string;

  constructor(
      private readonly deployment_: NamespacedResourceService<DeploymentDetail>,
      private readonly state_: StateService, private readonly kdState_: KdStateService) {}

  ngOnInit(): void {
    this.deploymentName_ = this.state_.params.resourceName;
    this.eventListEndpoint = EndpointManager.resource(Resource.deployment, true)
                                 .child(this.deploymentName_, Resource.event);
    this.oldReplicaSetsEndpoint = EndpointManager.resource(Resource.deployment, true)
                                      .child(this.deploymentName_, Resource.oldReplicaSet);

    this.deploymentSubscription_ =
        this.deployment_
            .get(EndpointManager.resource(Resource.deployment, true).detail(), this.deploymentName_)
            .startWith({})
            .subscribe((d: DeploymentDetail) => {
              this.deployment = d;
              this.isInitialized = true;
            });
  }

  getNewReplicaSetHref(): string {
    return this.kdState_.href(
        this.deployment.newReplicaSet.typeMeta.kind, this.deployment.newReplicaSet.objectMeta.name,
        this.deployment.newReplicaSet.objectMeta.namespace);
  }

  ngOnDestroy(): void {
    this.deploymentSubscription_.unsubscribe();
  }
}
