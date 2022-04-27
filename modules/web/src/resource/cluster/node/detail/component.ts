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
import {NodeAddress, NodeDetail, NodeTaint} from '@api/root.api';
import {RatioItem} from '@api/root.ui';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormattedValue} from '@common/components/graph/helper';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';

@Component({
  selector: 'kd-node-detail',
  templateUrl: './template.html',
})
export class NodeDetailComponent implements OnInit, OnDestroy {
  private readonly endpoint_ = EndpointManager.resource(Resource.node);
  private readonly unsubscribe_ = new Subject<void>();

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
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;

    this.podListEndpoint = this.endpoint_.child(resourceName, Resource.pod);
    this.eventListEndpoint = this.endpoint_.child(resourceName, Resource.event);

    this.node_
      .get(this.endpoint_.detail(), resourceName)
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((d: NodeDetail) => {
        this.node = d;
        this._getAllocation();
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Node', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
    this.actionbar_.onDetailsLeave.emit();
  }

  private _getAllocation(): void {
    const cpuLimitsValue = FormattedValue.NewFormattedCoreValue(this.node.allocatedResources.cpuLimits);
    const cpuRequestsValue = FormattedValue.NewFormattedCoreValue(this.node.allocatedResources.cpuRequests);
    const cpuCapacityValue = FormattedValue.NewFormattedCoreValue(this.node.allocatedResources.cpuCapacity);

    const memoryLimitsValue = FormattedValue.NewFormattedMemoryValue(this.node.allocatedResources.memoryLimits);
    const memoryRequestsValue = FormattedValue.NewFormattedMemoryValue(this.node.allocatedResources.memoryRequests);
    const memoryCapacityValue = FormattedValue.NewFormattedMemoryValue(this.node.allocatedResources.memoryCapacity);

    if (
      cpuLimitsValue.suffixPower !== cpuRequestsValue.suffixPower ||
      cpuLimitsValue.suffixPower !== cpuCapacityValue.suffixPower
    ) {
      const suffix =
        cpuLimitsValue.suffixPower < cpuRequestsValue.suffixPower ? cpuLimitsValue.suffix : cpuRequestsValue.suffix;

      cpuLimitsValue.normalize(suffix);
      cpuRequestsValue.normalize(suffix);
      cpuCapacityValue.normalize(suffix);
    }

    if (
      memoryLimitsValue.suffixPower !== memoryRequestsValue.suffixPower ||
      memoryLimitsValue.suffixPower !== memoryCapacityValue.suffixPower
    ) {
      const suffix =
        memoryLimitsValue.suffixPower < memoryRequestsValue.suffixPower
          ? memoryLimitsValue.suffix
          : memoryRequestsValue.suffix;

      memoryLimitsValue.normalize(suffix);
      memoryRequestsValue.normalize(suffix);
      memoryCapacityValue.normalize(suffix);
    }

    this.cpuLabel = cpuRequestsValue.suffix.length > 0 ? `${cpuRequestsValue.suffix}cores` : 'Cores';
    this.cpuCapacity = cpuCapacityValue.value;
    this.cpuAllocation = [
      {name: 'Requests', value: cpuRequestsValue.value},
      {name: 'Limits', value: cpuLimitsValue.value},
    ];

    this.memoryLabel = memoryRequestsValue.suffix.length > 0 ? `${memoryRequestsValue.suffix}B` : 'B';
    this.memoryCapacity = memoryCapacityValue.value;
    this.memoryAllocation = [
      {name: 'Requests', value: memoryRequestsValue.value},
      {name: 'Limits', value: memoryLimitsValue.value},
    ];

    this.podsAllocation = [{name: 'Allocation', value: this.node.allocatedResources.allocatedPods}];
  }

  getAddresses(): string[] {
    return this.node.addresses.map((address: NodeAddress) => `${address.type}: ${address.address}`);
  }

  getTaints(): string[] {
    return this.node.taints.map((taint: NodeTaint) => {
      return taint.value ? `${taint.key}=${taint.value}:${taint.effect}` : `${taint.key}=${taint.effect}`;
    });
  }
}
