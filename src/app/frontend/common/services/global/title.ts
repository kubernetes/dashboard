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

import {Injectable, Inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ConfigService} from './config';
import {GlobalSettingsService} from './globalsettings';

@Injectable()
export class TitleService {
  clusterName = '';
  private titleStr = '';
  constructor(
    @Inject(ConfigService) private config: ConfigService,
    private readonly title_: Title,
    private readonly settings_: GlobalSettingsService,
  ) {}

  update(): void {
    this.settings_.load(
      () => {
        this.clusterName = this.settings_.getClusterName();
        if (this.config.getCustomConfig()) {
          this.titleStr = this.config.getTitle();
        }

        this.apply_();
      },
      () => {
        this.clusterName = '';
        this.apply_();
      }
    );
  }

  private apply_(): void {
    if (this.clusterName && this.clusterName.length > 0) {
      this.titleStr = `${this.clusterName} - ` + this.titleStr;
    }

    this.title_.setTitle(this.titleStr);
  }
}
