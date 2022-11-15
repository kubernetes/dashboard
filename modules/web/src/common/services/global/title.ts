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

import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {GlobalSettingsService} from './globalsettings';

@Injectable()
export class TitleService {
  clusterName = '';

  constructor(private readonly title_: Title, private readonly settings_: GlobalSettingsService) {}

  update(): void {
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
    let title = 'Kubernetes Dashboard';

    if (this.clusterName && this.clusterName.length > 0) {
      title = `${this.clusterName} - ` + title;
    }

    this.title_.setTitle(title);
  }
}
