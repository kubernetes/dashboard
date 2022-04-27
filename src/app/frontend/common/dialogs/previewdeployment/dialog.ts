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

import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppDeploymentSpec} from '@api/root.api';

export interface PreviewDeploymentDialogData {
  spec: AppDeploymentSpec;
}

@Component({
  selector: 'kd-preview-deployment-dialog',
  templateUrl: 'template.html',
})
export class PreviewDeploymentDialog implements OnInit {
  @ViewChild('group', {static: true}) buttonToggleGroup: MatButtonToggleGroup;
  initialText = '';

  constructor(
    public dialogRef: MatDialogRef<PreviewDeploymentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PreviewDeploymentDialogData
  ) {}

  ngOnInit(): void {
    const configuration = this.toDeploymentConfiguration(this.data.spec);
    this.initialText = JSON.stringify(this.removeEmptyField(configuration));
  }

  private removeEmptyField(object: object) {
    return JSON.parse(JSON.stringify(object), (_, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'object' && Object.entries(value).length === 0) {
        return undefined;
      }
      if (Array.isArray(value) && (value.length === 0 || value.every(item => item === null))) {
        return undefined;
      }
      return value;
    });
  }

  private toDeploymentConfiguration(spec: AppDeploymentSpec) {
    const labels = Object.fromEntries(spec.labels.map(label => [label.key, label.value]));
    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: spec.name,
        namespace: spec.namespace,
        labels,
      },
      annotations: {
        description: spec.description,
      },
      spec: {
        replicas: spec.replicas,
        selector: {
          matchLabels: labels,
        },
        template: {
          metadata: {
            name: spec.name,
            labels,
          },
          annotations: {
            description: spec.description,
          },
          spec: {
            containers: [
              {
                name: spec.name,
                image: spec.containerImage,
                command: [spec.containerCommand],
                args: [spec.containerCommandArgs],
                env: spec.variables,
                resources: {
                  requests: {
                    cpu: spec.cpuRequirement,
                    memory: spec.memoryRequirement,
                  },
                },
                securityContext: {
                  privileged: spec.runAsPrivileged,
                },
              },
            ],
            imagePullSecrets: [
              {
                name: spec.imagePullSecret,
              },
            ],
          },
        },
      },
    };
  }
}
