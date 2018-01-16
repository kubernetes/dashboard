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
import {SettingsService} from './settings';

@Injectable()
export class TitleService {
  constructor(private titleService: Title, private settingsService: SettingsService) {}

  setTitle(transition: Transition) {
    const targetState = transition.to().name;  // TODO Use breadcrumb value instead.

    this.settingsService.getGlobalSettings().subscribe(
        (globalSettings) => {
          const clusterName = globalSettings.clusterName;
          if (clusterName) {
            this.titleService.setTitle(`${clusterName} - ${targetState} - Kubernetes Dashboard`);
          } else {
            this.titleService.setTitle(`${targetState} - Kubernetes Dashboard`);
          }
        },
        (err) => {
          this.titleService.setTitle(`${targetState} - Kubernetes Dashboard`);
        });
  }
}
