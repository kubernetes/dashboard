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
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable()
export class AssetsService {
  private readonly assetsPath = 'assets/images';
  private readonly appLogoSvg = 'kubernetes-logo.svg';
  private readonly appLogoTextSvg = 'kubernetes-logo-text.svg';
  private readonly appLogoIcon = 'kd-logo';
  private readonly appLogoTextIcon = 'kd-logo-text';

  constructor(
      @Inject(MatIconRegistry) iconRegistry: MatIconRegistry,
      @Inject(DomSanitizer) sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        this.appLogoIcon,
        sanitizer.bypassSecurityTrustResourceUrl(`${this.assetsPath}/${this.appLogoSvg}`));
    iconRegistry.addSvgIcon(
        this.appLogoTextIcon,
        sanitizer.bypassSecurityTrustResourceUrl(`${this.assetsPath}/${this.appLogoTextSvg}`));
  }

  getAppLogo() {
    return this.appLogoIcon;
  }

  getAppLogoText() {
    return this.appLogoTextIcon;
  }
}
