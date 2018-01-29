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

import {OverlayContainer} from '@angular/cdk/overlay';
import {Component, OnInit} from '@angular/core';

import {AssetsService} from '../common/services/global/assets';
import {overviewState} from '../overview/state';

@Component({selector: 'kd-chrome', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class ChromeComponent implements OnInit {
  loading = false;

  constructor(public assets: AssetsService, private overlayContainer_: OverlayContainer) {}

  getOverviewStateName() {
    return overviewState.name;
  }

  isSystemBannerVisible() {
    return false;
  }

  getSystemBannerClass() {
    return 'kd-bg-warning';
  }

  getSystemBannerMessage() {
    return `<b>System is going to be shut down in 5 min...</b>`;
  }

  create() {}

  ngOnInit() {
    this.overlayContainer_.getContainerElement().classList.add('kd-dark-theme');
  }
}
