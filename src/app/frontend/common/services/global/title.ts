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
  private readonly defaultTitle_ = 'Kubernetesxxx Dashboard';

  constructor(private titleService: Title) {}

  setTitle(transition: Transition) {
    console.log('settitle');
    console.log(transition);

    let windowTitle = '';

    const clusterName = '';  // TODO Get from settings.
    if (clusterName) {
      windowTitle += `${clusterName} - `;
    }

    // let conf = this.kdBreadcrumbsService_.getBreadcrumbConfig(this.futureStateService_.state);
    // if (conf && conf.label) {
    //   let params = this.futureStateService_.params;
    //   let stateLabel = this.interpolate_(conf.label)({'$stateParams': params}).toString();
    //   windowTitle += `${stateLabel} - `;
    // } TODO

    windowTitle += this.defaultTitle_;
    this.titleService.setTitle(windowTitle);
  }
}
