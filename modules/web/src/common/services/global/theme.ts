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

import {DOCUMENT} from '@angular/common';
import {EventEmitter, Inject, Injectable} from '@angular/core';
import {Theme} from '@api/root.api';
import {ThemeSwitchCallback} from '@api/root.ui';
import {LocalConfigLoaderService} from '@common/services/global/loader';

@Injectable()
export class ThemeService {
  static readonly SystemTheme = '__system_theme__';
  private _customThemes: Theme[] = [];
  private readonly _defaultThemes: Theme[] = [
    {name: 'kd-light-theme', displayName: 'Light', isDark: false},
    {name: 'kd-dark-theme', displayName: 'Dark', isDark: true},
  ];
  private readonly _onThemeSwitchEvent = new EventEmitter<string>();
  private readonly _colorSchemeQuery = '(prefers-color-scheme: dark)';

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _config: LocalConfigLoaderService
  ) {}

  private _theme = ThemeService.SystemTheme;

  get theme(): string {
    return this._theme;
  }

  set theme(theme: string) {
    this._theme = theme;

    if (theme === ThemeService.SystemTheme) {
      theme = this._isSystemThemeDark() ? 'kd-dark-theme' : 'kd-light-theme';
    }
    this._onThemeSwitchEvent.emit(theme);
  }

  get themes(): Theme[] {
    const defaultThemeNames = new Set(this._defaultThemes.map(theme => theme.name));
    const filteredCustomThemes = this._customThemes.filter(theme => !defaultThemeNames.has(theme.name));
    return [...this._defaultThemes, ...filteredCustomThemes];
  }

  init(): void {
    this._document.defaultView.matchMedia(this._colorSchemeQuery).addEventListener('change', e => {
      if (this.theme === ThemeService.SystemTheme) {
        this._onThemeSwitchEvent.emit(e.matches ? 'kd-dark-theme' : 'kd-light-theme');
      }
    });

    this._customThemes = this._config.appConfig.themes;
  }

  subscribe(callback: ThemeSwitchCallback): void {
    this._onThemeSwitchEvent.subscribe(callback);
  }

  isThemeDark(): boolean {
    if (this.theme === ThemeService.SystemTheme) {
      return this._isSystemThemeDark();
    }

    const theme = this.themes.find(theme => theme.name === this.theme);
    return theme ? theme.isDark : false;
  }

  private _isSystemThemeDark(): boolean {
    return (
      this._document.defaultView.matchMedia && this._document.defaultView.matchMedia(this._colorSchemeQuery).matches
    );
  }
}
