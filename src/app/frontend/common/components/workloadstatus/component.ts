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
import {ResourcesRatio} from '@api/root.ui';

export const emptyResourcesRatio: ResourcesRatio = {
  cronJobRatio: [],
  daemonSetRatio: [],
  deploymentRatio: [],
  jobRatio: [],
  podRatio: [],
  replicaSetRatio: [],
  replicationControllerRatio: [],
  statefulSetRatio: [],
};

@Component({
  selector: 'kd-workload-statuses',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class WorkloadStatusComponent {
  @Input() resourcesRatio = emptyResourcesRatio;
  colors: string[] = [];
  animations = false;
  labels = true;
  trimLabels = false;
  size = [350, 250];

  getCustomColor(label: string): string {
    if (label.includes('Running')) {
      return '#00c752';
    } else if (label.includes('Succeeded')) {
      return '#006028';
    } else if (label.includes('Pending')) {
      return '#ffad20';
    } else if (label.includes('Failed')) {
      return '#f00';
    }
    return '';
  }
}
