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
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {LogsComponent} from 'logs/component';
import {ConfigService} from './config';

@Injectable()
export class AssetsService {
  private readonly assetsPath_ = 'assets/images';
  private appLogoSvg_ = 'kubernetes-logo.svg';
  private readonly appLogoTextSvg_ = 'kubernetes-logo-text.svg';
  private readonly appLogoIcon_ = 'kd-logo';
  private readonly appLogoTextIcon_ = 'kd-logo-text';

  constructor(
    @Inject(MatIconRegistry) private readonly iconRegistry_: MatIconRegistry,
    @Inject(DomSanitizer) private readonly sanitizer_: DomSanitizer,
    @Inject(ConfigService) private config: ConfigService,
  ) {
    if (config.getCustomConfig()) {
      this.appLogoSvg_ = config.getCustomConfig()['logo'];
    }

    if (!this.appLogoSvg_.includes('http')) {
      iconRegistry_.addSvgIcon(
        this.appLogoIcon_,
        sanitizer_.bypassSecurityTrustResourceUrl(`${this.assetsPath_}/${this.appLogoSvg_}`),
      );
    } else {
      this.iconRegistry_.addSvgIcon(
        this.appLogoIcon_,
        sanitizer_.bypassSecurityTrustResourceUrl(`${this.appLogoSvg_}`),
      );
    }
    this.iconRegistry_.addSvgIcon(
      this.appLogoTextIcon_,
      sanitizer_.bypassSecurityTrustResourceUrl(`${this.assetsPath_}/${this.appLogoTextSvg_}`),
    );

    iconRegistry_.addSvgIcon('pin', sanitizer_.bypassSecurityTrustResourceUrl(`${this.assetsPath_}/pin.svg`));
    iconRegistry_.addSvgIcon(
      'pin-crossed',
      sanitizer_.bypassSecurityTrustResourceUrl(`${this.assetsPath_}/pin-crossed.svg`),
    );
  }

  getAppLogo(): string {
    const a = 2;
    return this.appLogoIcon_;
  }

  getAppLogoText(): string {
    return this.appLogoTextIcon_;
  }
}
