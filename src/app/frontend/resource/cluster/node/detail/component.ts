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
import {NodeAddress, NodeDetail, NodeTaint} from '@api/backendapi';
import {Subscription} from 'rxjs/Subscription';

import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {ResourceService} from '../../../../common/services/resource/resource';
import {RatioItem} from '@api/frontendapi';
import {
  coresFilter,
  coresFilterDivider,
  memoryFilter,
  memoryFilterDivider,
} from '../../../../common/components/graph/helper';

@Component({
  selector: 'kd-node-detail',
  templateUrl: './template.html',
})
export class NodeDetailComponent implements OnInit, OnDestroy {
  private nodeSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.node);
  node: NodeDetail;
  isInitialized = false;
  podListEndpoint: string;
  eventListEndpoint: string;
  cpuLabel = 'Cores';
  cpuCapacity = 0;
  cpuAllocation: RatioItem[] = [];
  memoryLabel = 'B';
  memoryCapacity = 0;
  memoryAllocation: RatioItem[] = [];
  podsAllocation: RatioItem[] = [];
  customColors = [
    {name: 'Requests', value: '#00c752'},
    {name: 'Limits', value: '#ffad20'},
    {name: 'Allocation', value: '#00c752'},
  ];

  constructor(
    private readonly node_: ResourceService<NodeDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;

    this.podListEndpoint = this.endpoint_.child(resourceName, Resource.pod);
    this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event);

    this.nodeSubscription_ = this.node_
      .get(this.endpoint_.detail(), resourceName)
      .subscribe((d: NodeDetail) => {
        this.node = d;
        this._getAllocation();
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Node', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.nodeSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }

  private _getAllocation(): void {
    const minCpu = Math.min(
      this.node.allocatedResources.cpuRequests,
      this.node.allocatedResources.cpuLimits,
    );
    const minCpuDivider = coresFilterDivider(minCpu) * 1000;
    const formattedMinCpu = coresFilter(minCpu).split(' ');
    this.cpuLabel = formattedMinCpu.length > 1 ? `${formattedMinCpu[1]}cores` : 'Cores';
    this.cpuCapacity = this.node.allocatedResources.cpuCapacity / minCpuDivider;
    this.cpuAllocation = [
      {name: 'Requests', value: this.node.allocatedResources.cpuRequests / minCpuDivider},
      {name: 'Limits', value: this.node.allocatedResources.cpuLimits / minCpuDivider},
    ];

    const minMemory = Math.min(
      this.node.allocatedResources.memoryRequests,
      this.node.allocatedResources.memoryLimits,
    );
    const minMemoryDivider = memoryFilterDivider(minMemory);
    const formattedMinMemory = memoryFilter(minMemory).split(' ');
    this.memoryLabel = formattedMinMemory.length > 1 ? `${formattedMinMemory[1]}B` : 'B';
    this.memoryCapacity = this.node.allocatedResources.memoryCapacity / minMemoryDivider;
    this.memoryAllocation = [
      {name: 'Requests', value: this.node.allocatedResources.memoryRequests / minMemoryDivider},
      {name: 'Limits', value: this.node.allocatedResources.memoryLimits / minMemoryDivider},
    ];

    this.podsAllocation = [{name: 'Allocation', value: this.node.allocatedResources.allocatedPods}];
  }

  getAddresses(): string[] {
    return this.node.addresses.map((address: NodeAddress) => `${address.type}: ${address.address}`);
  }

  getTaints(): string[] {
    return this.node.taints.map((taint: NodeTaint) => {
      return taint.value
        ? `${taint.key}=${taint.value}:${taint.effect}`
        : `${taint.key}=${taint.effect}`;
    });
  }
}
