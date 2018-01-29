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

import {Component, OnInit} from '@angular/core';
import {ThemeService} from './common/services/global/theme';

enum Themes {
  Light = 'kd-light-theme',
  Dark = 'kd-dark-theme'
}

@Component({selector: 'kd-root', template: '<ui-view [ngClass]="getTheme()"></ui-view>'})
export class RootComponent implements OnInit {
  isLightThemeEnabled: boolean;
  constructor(private themeService_: ThemeService) {
    this.isLightThemeEnabled = this.themeService_.isLightThemeEnabled();
  }

  ngOnInit() {
    this.themeService_.subscribe(this.onThemeChange.bind(this));
  }

  onThemeChange(isLightThemeEnabled: boolean) {
    this.isLightThemeEnabled = isLightThemeEnabled;
  }

  getTheme(): string {
    return this.isLightThemeEnabled ? Themes.Light : Themes.Dark;
  }
}
