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

import {Inject, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Transition} from '@uirouter/angular';

@Injectable()
export class TitleService {
  private readonly defaultTitle_ = 'Kubernetes Dashboard';

  constructor(private titleService: Title) {}

  setTitle(transition: Transition) {
    let windowTitle = '';

    const clusterName = '';  // TODO Get from settings.
    if (clusterName) {
      windowTitle += `${clusterName} - `;
    }

    const targetState = transition.to().name;  // TODO Use breadcrumb value instead.

    windowTitle += `${targetState} - ${this.defaultTitle_}`;
    this.titleService.setTitle(windowTitle);
  }
}
