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

import { Component, Input } from '@angular/core';
import {
  ConfigMapKeyRef,
  Container,
  EnvVar,
  SecretKeyRef,
} from 'typings/backendapi';
import { stateName as configMapState } from '../../../resource/config/configmap/state';
import { stateName as secretState } from '../../../resource/config/secret/state';

@Component({
  selector: 'kd-container-card',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class ContainerCardComponent {
  @Input() container: Container;
  @Input() namespace: string;
  @Input() initialized: boolean;

  isSecret(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.secretKeyRef;
  }

  isConfigMap(envVar: EnvVar): boolean {
    return !!envVar.valueFrom && !!envVar.valueFrom.configMapKeyRef;
  }

  formatSecretValue(s: string): string {
    return atob(s);
  }

  // TODO: Implement a service that will be responsible for creating links to states
  getEnvConfigMapHref(configMapKeyRef: ConfigMapKeyRef): string {
    return `#/${configMapState}/${this.namespace}/${
      configMapKeyRef.name
    }?namespace=${this.namespace}`;
  }

  getEnvSecretHref(secretKeyRef: SecretKeyRef): string {
    return `#/${secretState}/${this.namespace}/${secretKeyRef.name}?namespace=${
      this.namespace
    }`;
  }

  isHref(envVar: EnvVar): boolean {
    return (
      !!envVar.valueFrom &&
      (!!envVar.valueFrom.configMapKeyRef || !!envVar.valueFrom.secretKeyRef)
    );
  }
}
