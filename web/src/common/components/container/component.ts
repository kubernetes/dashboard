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

import {Component, Input, OnChanges} from '@angular/core';
import {ConfigMapKeyRef, Container, EnvVar, SecretKeyRef} from '@api/root.api';
import {Status, StatusClass} from '@common/components/resourcelist/statuses';
import {DecoderService} from '@common/services/global/decoder';
import {KdStateService} from '@common/services/global/state';
import _ from 'lodash';

@Component({
  selector: 'kd-container-card',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class ContainerCardComponent implements OnChanges {
  @Input() container: Container;
  @Input() namespace: string;
  @Input() initialized: boolean;

  constructor(private readonly state_: KdStateService, readonly decoder: DecoderService) {}

  get containerStatusClass(): string {
    if (this.isTerminated_() && this.container.status.state.terminated.reason !== Status.Completed) {
      return StatusClass.Error;
    }

    if (this.isWaiting_()) {
      return StatusClass.Warning;
    }

    if (this.isRunning_() || this.isTerminated_()) {
      return StatusClass.Success;
    }

    return StatusClass.Unknown;
  }

  get containerStatus(): string {
    if (this.container.status && this.container.status.state.terminated) {
      return Status.Terminated;
    }

    if (this.container.status && this.container.status.state.waiting) {
      return Status.Waiting;
    }

    if (this.container.status && this.container.status.ready && this.container.status.started) {
      return Status.Running;
    }

    return Status.Unknown;
  }

  ngOnChanges(): void {
    this.container.env = this.container.env.sort((a, b) => a.name.localeCompare(b.name));
  }

  isSecret(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.secretKeyRef;
  }

  isConfigMap(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.configMapKeyRef;
  }

  getEnvConfigMapHref(configMapKeyRef: ConfigMapKeyRef): string {
    return this.state_.href('configmap', configMapKeyRef.name, this.namespace);
  }

  getEnvSecretHref(secretKeyRef: SecretKeyRef): string {
    return this.state_.href('secret', secretKeyRef.name, this.namespace);
  }

  getEnvVarID(_: number, envVar: EnvVar): string {
    return `${envVar.name}-${envVar.value}`;
  }

  hasSecurityContext(): boolean {
    return this.container && !_.isEmpty(this.container.securityContext);
  }

  private hasState_(): boolean {
    return !!this.container && !!this.container.status && !!this.container.status.state;
  }

  private isWaiting_(): boolean {
    return this.hasState_() && !!this.container.status.state.waiting;
  }

  private isTerminated_(): boolean {
    return this.hasState_() && !!this.container.status.state.terminated;
  }

  private isRunning_(): boolean {
    return this.hasState_() && !!this.container.status.state.running;
  }
}
