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
import {ObjectMeta, TypeMeta} from '@api/root.api';
import {ActionColumn} from '@api/root.ui';
import {PinnerService} from '@common/services/global/pinner';
import {KdStateService} from '@common/services/global/state';
import {VerberService} from '@common/services/global/verber';
import {Resource} from '@common/services/resource/endpoint';

const loggableResources: string[] = [
  Resource.daemonSet,
  Resource.job,
  Resource.pod,
  Resource.replicaSet,
  Resource.replicationController,
  Resource.statefulSet,
];

const pinnableResources: string[] = [Resource.crdFull];
const executableResources: string[] = [Resource.pod];
const triggerableResources: string[] = [Resource.cronJob];

@Component({
  selector: 'kd-resource-context-menu',
  templateUrl: './template.html',
})
export class MenuComponent implements ActionColumn {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;
  @Input() displayName: string;
  @Input() namespaced: boolean;

  constructor(
    private readonly verber_: VerberService,
    private readonly router_: Router,
    private readonly kdState_: KdStateService,
    private readonly pinner_: PinnerService
  ) {}

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  setDisplayName(displayName: string): void {
    this.displayName = displayName;
  }

  setNamespaced(namespaced: boolean): void {
    this.namespaced = namespaced;
  }

  isLogsEnabled(): boolean {
    return loggableResources.includes(this.typeMeta.kind);
  }

  getLogsHref(): string {
    return this.kdState_.href('log', this.objectMeta.name, this.objectMeta.namespace, this.typeMeta.kind);
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
    return this.typeMeta.scalable;
  }

  onScale(): void {
    this.verber_.showScaleDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  isPinEnabled(): boolean {
    return pinnableResources.includes(this.typeMeta.kind);
  }

  onPin(): void {
    this.pinner_.pin(
      this.typeMeta.kind,
      this.objectMeta.name,
      this.objectMeta.namespace,
      this.displayName ? this.displayName : this.objectMeta.name,
      this.namespaced
    );
  }

  onUnpin(): void {
    this.pinner_.unpin(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
  }

  isPinned(): boolean {
    return this.pinner_.isPinned(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
  }

  onEdit(): void {
    this.verber_.showEditDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  isRestartEnabled(): boolean {
    return this.typeMeta.restartable;
  }

  onRestart(): void {
    this.verber_.showRestartDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onDelete(): void {
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }
}
