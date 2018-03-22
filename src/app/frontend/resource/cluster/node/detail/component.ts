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
import {MatTableDataSource} from '@angular/material';
import {Condition, NodeAddress, NodeDetail, NodeTaint} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {ResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-node-detail',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NodeDetailComponent implements OnInit, OnDestroy {
  private nodeSubscription_: Subscription;
  private nodeName_: string;
  node: NodeDetail;
  isInitialized = false;
  podListEndpoint: string;
  eventListEndpoint: string;

  constructor(
      private readonly node_: ResourceService<NodeDetail>, private readonly state_: StateService) {}

  ngOnInit(): void {
    this.nodeName_ = this.state_.params.resourceName;
    this.podListEndpoint =
        EndpointManager.resource(Resource.node).child(this.nodeName_, Resource.pod);
    this.eventListEndpoint =
        EndpointManager.resource(Resource.node, false).child(this.nodeName_, Resource.event);
    this.nodeSubscription_ =
        this.node_.get(EndpointManager.resource(Resource.node).detail(), this.nodeName_)
            .subscribe((d: NodeDetail) => {
              this.node = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.nodeSubscription_.unsubscribe();
  }

  getAddresses(): string[] {
    return this.node.addresses.map((address: NodeAddress) => `${address.type}: ${address.address}`);
  }

  getTaints(): string[] {
    return this.node.taints.map((taint: NodeTaint) => {
      return taint.value ? `${taint.key}=${taint.value}:${taint.effect}` :
                           `${taint.key}=${taint.effect}`;
    });
  }
}
