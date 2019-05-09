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

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Transition } from '@uirouter/angular';

import { BreadcrumbsService } from './breadcrumbs';
import { GlobalSettingsService } from './globalsettings';

@Injectable()
export class TitleService {
  clusterName = '';
  stateName = '';

  constructor(
    private readonly title_: Title,
    private readonly settings_: GlobalSettingsService,
    private readonly breadcrumbs_: BreadcrumbsService
  ) {}

  update(transition?: Transition): void {
    if (transition) {
      this.stateName = this.breadcrumbs_.getDisplayName(
        transition.targetState().$state()
      );
    }

    this.settings_.load(
      () => {
        this.clusterName = this.settings_.getClusterName();
        this.apply_();
      },
      () => {
        this.clusterName = '';
        this.apply_();
      }
    );
  }

  private apply_(): void {
    let title = '';

    if (this.clusterName && this.clusterName.length > 0) {
      title += `${this.clusterName} - `;
    }

    title += `${this.stateName} - Kubernetes Dashboard`;
    this.title_.setTitle(title);
  }
}
