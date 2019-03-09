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

export enum StatusBarColor {
  Succeeded = '#66bb6a',
  Running = '#388e3c',
  Failed = '#e53935',
  Suspended = '#ffb300',
  Pending = '#f4511e'
}

export interface StatusBarItem {
  key: string;
  color: string;
  value: number;
}

@Component(
    {selector: 'kd-status-ratio-bar', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class StatusRatioBarComponent {
  @Input() items: StatusBarItem[];

  get data() {
    return this.items.filter(item => item.value !== 0)
        .map(item => ({...item, value: `${item.value}%`}));
  }

  trackByFn = (index: number) => index;
}
