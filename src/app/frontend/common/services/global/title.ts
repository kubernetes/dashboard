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
import {StateService} from '@uirouter/core';

import {BreadcrumbsService} from './breadcrumbs';
import {SettingsService} from './settings';

@Injectable()
export class TitleService {
  constructor(
      private readonly title_: Title, private readonly settings_: SettingsService,
      private readonly breadcrumbs_: BreadcrumbsService) {}

  setTitle(transition: Transition): void {
    const state = this.breadcrumbs_.getDisplayName(transition.targetState().state());
    this.settings_.loadGlobalSettings(
        () => {
          const clusterName = this.settings_.getClusterName();
          if (clusterName) {
            this.title_.setTitle(`${clusterName} - ${state} - Kubernetes Dashboard`);
          } else {
            this.title_.setTitle(`${state} - Kubernetes Dashboard`);
          }
        },
        () => {
          this.title_.setTitle(`${state} - Kubernetes Dashboard`);
        });
  }
}
