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

import {OverlayContainer} from '@angular/cdk/overlay';
import {Component, ElementRef, OnInit} from '@angular/core';

import {LocalSettingsService} from './common/services/global/localsettings';
import {ThemeService} from './common/services/global/theme';
import {TitleService} from './common/services/global/title';

enum Themes {
  Light = 'kd-light-theme',
  Dark = 'kd-dark-theme',
}

@Component({selector: 'kd-root', template: '<router-outlet></router-outlet>'})
export class RootComponent implements OnInit {
  private isLightThemeEnabled_: boolean;

  constructor(
    private readonly themeService_: ThemeService,
    private readonly settings_: LocalSettingsService,
    private readonly overlayContainer_: OverlayContainer,
    private readonly kdRootRef: ElementRef,
    private readonly titleService_: TitleService,
  ) {
    this.isLightThemeEnabled_ = this.themeService_.isLightThemeEnabled();
  }

  ngOnInit(): void {
    this.titleService_.update();
    this.themeService_.subscribe(this.onThemeChange_.bind(this));

    const localSettings = this.settings_.get();
    if (localSettings && localSettings.isThemeDark) {
      this.themeService_.switchTheme(!localSettings.isThemeDark);
      this.isLightThemeEnabled_ = !localSettings.isThemeDark;
    }

    this.applyOverlayContainerTheme_();
  }

  private applyOverlayContainerTheme_(): void {
    const classToRemove = this.getTheme(!this.isLightThemeEnabled_);
    const classToAdd = this.getTheme(this.isLightThemeEnabled_);
    this.overlayContainer_.getContainerElement().classList.remove(classToRemove);
    this.overlayContainer_.getContainerElement().classList.add(classToAdd);

    this.kdRootRef.nativeElement.classList.add(classToAdd);
    this.kdRootRef.nativeElement.classList.remove(classToRemove);
  }

  private onThemeChange_(isLightThemeEnabled: boolean): void {
    this.isLightThemeEnabled_ = isLightThemeEnabled;
    this.applyOverlayContainerTheme_();
  }

  getTheme(isLightThemeEnabled?: boolean): string {
    if (isLightThemeEnabled === undefined) {
      isLightThemeEnabled = this.isLightThemeEnabled_;
    }

    return isLightThemeEnabled ? Themes.Light : Themes.Dark;
  }
}
