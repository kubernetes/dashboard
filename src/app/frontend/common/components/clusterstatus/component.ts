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
import {ResourcesAllocation} from '@api/root.ui';

export const emptyResourcesAllocation: ResourcesAllocation = {
  nodeResources: [],
  cpuResources: [],
  memoryResources: [],
  podResources: [],
};

@Component({
  selector: 'kd-cluster-statuses',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class ClusterStatusComponent {
  @Input() resourcesAllocation = emptyResourcesAllocation;
  colors: string[] = [];
  animations = false;
  labels = true;
  trimLabels = false;
  size = [350, 250];

  getStatusColor(label: string): string {
    if (label.includes('Ready')) {
      return '#00c752';
    } else if (label.includes('NotReady')) {
      return '#f00';
    } else if (label.includes('Unknown')) {
      return '#eeeeee';
    }
    return '';
  }

  getCustomColor(label: string): string {
    if (label.includes('Requests')) {
      return '#00c752';
    } else if (label.includes('Limits')) {
      return '#ffad20';
    } else if (label.includes('Allocation')) {
      return '#00c752';
    } else if (label.includes('Capacity')) {
      return '#99e9ba';
    }
    return '';
  }
}
