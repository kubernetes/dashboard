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

import {Component, Input, OnDestroy} from '@angular/core';
import {ObjectMeta, TypeMeta} from '@api/backendapi';
import {ActionColumn} from '@api/frontendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {logsState} from '../../../../../logs/state';
import {LogsStateParams} from '../../../../params/params';
import {KdStateService} from '../../../../services/global/state';
import {VerberService} from '../../../../services/global/verber';
import {Resource} from '../../../../services/resource/endpoint';

const loggableResources: string[] = [
  Resource.daemonSet, Resource.job, Resource.pod, Resource.replicaSet,
  Resource.replicationController, Resource.statefulSet
];

const scalableResources: string[] = [
  Resource.deployment, Resource.replicaSet, Resource.replicationController, Resource.statefulSet
];

@Component({
  selector: 'kd-resource-context-menu',
  templateUrl: './template.html',
})
export class MenuComponent implements ActionColumn, OnDestroy {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;

  private onScaleSubscription_: Subscription;
  private onEditSubscription_: Subscription;
  private onDeleteSubscription_: Subscription;

  constructor(
      private readonly verber_: VerberService, private readonly state_: StateService,
      private readonly kdState_: KdStateService) {}

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  ngOnDestroy(): void {
    if (this.onScaleSubscription_) this.onScaleSubscription_.unsubscribe();
    if (this.onEditSubscription_) this.onEditSubscription_.unsubscribe();
    if (this.onDeleteSubscription_) this.onDeleteSubscription_.unsubscribe();
  }

  showOption(optionName: string): boolean {
    return (optionName === 'logs' && loggableResources.includes(this.typeMeta.kind)) ||
        (optionName === 'scale' && scalableResources.includes(this.typeMeta.kind)) ||
        (optionName === 'exec' && this.typeMeta.kind === Resource.pod);
  }

  getLogsHref(): string {
    return this.state_.href(
        logsState.name,
        new LogsStateParams(this.objectMeta.namespace, this.objectMeta.name, this.typeMeta.kind));
  }

  getExecHref(): string {
    return this.kdState_.href('shell', this.objectMeta.name, this.objectMeta.namespace);
  }

  onScale() {
    this.onScaleSubscription_ = this.verber_.onScale.subscribe(this.onSuccess_.bind(this));
    this.verber_.showScaleDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onEdit(): void {
    this.onEditSubscription_ = this.verber_.onEdit.subscribe(this.onSuccess_.bind(this));
    this.verber_.showEditDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onDelete(): void {
    this.onDeleteSubscription_ = this.verber_.onDelete.subscribe(this.onSuccess_.bind(this));
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  private onSuccess_(): void {
    this.state_.reload();
  }
}
