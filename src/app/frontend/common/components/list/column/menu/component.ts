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

import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {ObjectMeta, TypeMeta} from '@api/backendapi';
import {ActionColumn} from '@api/frontendapi';
import {first} from 'rxjs/operators';
import {KdStateService} from '../../../../services/global/state';
import {VerberService} from '../../../../services/global/verber';
import {Resource} from '../../../../services/resource/endpoint';

const loggableResources: string[] = [
  Resource.daemonSet,
  Resource.job,
  Resource.pod,
  Resource.replicaSet,
  Resource.replicationController,
  Resource.statefulSet,
];

const scalableResources: string[] = [
  Resource.deployment,
  Resource.replicaSet,
  Resource.replicationController,
  Resource.statefulSet,
];

const executableResources: string[] = [Resource.pod];

const triggerableResources: string[] = [Resource.cronJob];

@Component({
  selector: 'kd-resource-context-menu',
  templateUrl: './template.html',
})
export class MenuComponent implements ActionColumn {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;

  constructor(
      private readonly verber_: VerberService, private readonly router_: Router,
      private readonly kdState_: KdStateService) {}

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  isLogsEnabled(): boolean {
    return loggableResources.includes(this.typeMeta.kind);
  }

  getLogsHref(): string {
    return this.kdState_.href(
        'log', this.objectMeta.name, this.objectMeta.namespace, this.typeMeta.kind);
  }

  isExecEnabled(): boolean {
    return executableResources.includes(this.typeMeta.kind);
  }

  getExecHref(): string {
    return this.kdState_.href('shell', this.objectMeta.name, this.objectMeta.namespace);
  }

  isTriggerEnabled(): boolean {
    return triggerableResources.includes(this.typeMeta.kind);
  }

  onTrigger(): void {
    this.verber_.showTriggerDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  isScaleEnabled(): boolean {
    return scalableResources.includes(this.typeMeta.kind);
  }

  onScale(): void {
    this.verber_.showScaleDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onEdit(): void {
    this.verber_.showEditDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onDelete(): void {
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }
}
