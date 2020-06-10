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
import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AssetsService} from '../common/services/global/assets';
import {GlobalSettingsService} from '../common/services/global/globalsettings';

class SystemBanner {
  message: string;
  severity: string;
}

@Component({
  selector: 'kd-chrome',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class ChromeComponent implements OnInit {
  private static readonly systemBannerEndpoint = 'api/v1/systembanner';
  private systemBanner_: SystemBanner;
  loading = false;

  constructor(
    public assets: AssetsService,
    private readonly http_: HttpClient,
    private readonly router_: Router,
    @Inject(DOCUMENT) private readonly document_: Document,
    private readonly globalSettings_: GlobalSettingsService,
  ) {}

  ngOnInit(): void {
    this.http_
      .get<SystemBanner>(ChromeComponent.systemBannerEndpoint)
      .toPromise()
      .then(sb => {
        this.systemBanner_ = sb;
      });

    this.registerVisibilityChangeHandler_();
  }

  getOverviewStateName(): string {
    return '/overview';
  }

  isSystemBannerVisible(): boolean {
    return this.systemBanner_ && this.systemBanner_.message.length > 0;
  }

  getSystemBannerClass(): string {
    const severity = this.systemBanner_ && this.systemBanner_.severity ? this.systemBanner_.severity.toLowerCase() : '';
    switch (severity) {
      case 'warning':
        return 'kd-bg-warning-light';
      case 'error':
        return 'kd-bg-error-light';
      default:
        return 'kd-bg-success-light';
    }
  }

  getSystemBannerMessage(): string {
    return this.systemBanner_ ? this.systemBanner_.message : '';
  }

  goToCreateState(): void {
    this.router_.navigate(['create'], {queryParamsHandling: 'preserve'});
  }

  private registerVisibilityChangeHandler_(): void {
    if (typeof this.document_.addEventListener === 'undefined') {
      console.log(
        'Your browser does not support Page Visibility API. Page cannot properly stop background tasks when tab is inactive.',
      );
      return;
    }

    this.document_.addEventListener('visibilitychange', this.handleVisibilityChange_.bind(this), false);
  }

  private handleVisibilityChange_(): void {
    this.globalSettings_.onPageVisibilityChange.emit(!this.document_.hidden);
  }
}
