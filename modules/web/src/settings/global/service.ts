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
import {GlobalSettings} from '@api/root.api';
import _ from 'lodash';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SettingsHelperService {
  onSettingsChange = new Subject<GlobalSettings>();

  private settings_: GlobalSettings = {} as GlobalSettings;

  get settings(): GlobalSettings {
    return this.settings_;
  }

  set settings(settings: GlobalSettings) {
    this.settings_ = _.extend(this.settings_, settings);
    this.onSettingsChange.next(this.settings_);
  }

  reset(): void {
    this.settings_ = {} as GlobalSettings;
    this.onSettingsChange.next(this.settings_);
  }
}
