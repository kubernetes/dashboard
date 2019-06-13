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

@Injectable()
export class ThemeService {
  private isLightThemeEnabled_ = true;
  private readonly onThemeSwitchEvent_ = new EventEmitter<boolean>();

  isLightThemeEnabled(): boolean {
    return this.isLightThemeEnabled_;
  }

  switchTheme(isLightTheme: boolean): void {
    this.onThemeSwitchEvent_.emit(isLightTheme);
    this.isLightThemeEnabled_ = isLightTheme;
  }

  subscribe(callback: ThemeSwitchCallback): void {
    this.onThemeSwitchEvent_.subscribe(callback);
  }
}
