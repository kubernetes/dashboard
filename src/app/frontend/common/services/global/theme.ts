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

import {EventEmitter, Injectable} from '@angular/core';
import {ThemeSwitchCallback} from '@api/frontendapi';
import {Theme} from '@api/backendapi';

@Injectable()
export class ThemeService {
  private _availableThemes = [Theme.Light, Theme.Dark];
  private _theme = Theme.Light;
  private readonly onThemeSwitchEvent_ = new EventEmitter<string>();

  get availableThemes(): Theme[] {
    return this._availableThemes;
  }

  get theme(): Theme {
    return this._theme;
  }

  set theme(theme: Theme) {
    this.onThemeSwitchEvent_.emit(theme);
    this._theme = theme;
  }

  subscribe(callback: ThemeSwitchCallback): void {
    this.onThemeSwitchEvent_.subscribe(callback);
  }
}
