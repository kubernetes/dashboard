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
import {ConfigMapKeyRef, Container, EnvVar, SecretKeyRef} from '@api/backendapi';
import {KdStateService} from '../../services/global/state';

@Component({
  selector: 'kd-container-card',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class ContainerCardComponent implements OnChanges {
  @Input() container: Container;
  @Input() namespace: string;
  @Input() initialized: boolean;

  constructor(private readonly state_: KdStateService) {}

  ngOnChanges(): void {
    this.container.env = this.container.env.sort((a, b) => a.name.localeCompare(b.name));
  }

  isSecret(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.secretKeyRef;
  }

  isConfigMap(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.configMapKeyRef;
  }

  formatSecretValue(s: string): string {
    return atob(s);
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
}
