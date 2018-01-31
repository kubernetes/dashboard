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

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Error, GlobalSettings, LocalSettings} from '@api/backendapi';

import {AuthorizerService} from './authorizer';
import {ThemeService} from './theme';

type onLoadCb = (settings?: GlobalSettings) => void;
type onFailCb = (err?: string|Error) => void;

@Injectable()
export class SettingsService {
  private readonly globalSettingsEndpoint_ = 'api/v1/settings/global';
  private globalSettings_: GlobalSettings = {
    itemsPerPage: 10,
    clusterName: '',
    autoRefreshTimeInterval: 5,
  };
  private localSetttings_: LocalSettings;
  private isInitialized_ = false;

  constructor(
      private http_: HttpClient, private authorizer_: AuthorizerService,
      private theme_: ThemeService) {}

  init() {
    this.load();
  }

  isInitialized() {
    return this.isInitialized_;
  }

  load(onLoad?: onLoadCb, onFail?: onFailCb) {
    this.authorizer_.proxyGET<GlobalSettings>(this.globalSettingsEndpoint_)
        .toPromise()
        .then(
            (settings) => {
              this.globalSettings_ = settings;
              this.isInitialized_ = true;
              if (onLoad) onLoad(settings);
            },
            (err) => {
              this.isInitialized_ = false;
              if (onFail) onFail(err);
            });
  }

  getClusterName() {
    return this.globalSettings_.clusterName;
  }

  getItemsPerPage() {
    return this.globalSettings_.itemsPerPage;
  }

  getAutoRefreshTimeInterval() {
    return this.globalSettings_.autoRefreshTimeInterval;
  }

  // TODO
  getLocalSettings(): LocalSettings {
    return {isThemeDark: false};
  }

  /*
   * Save local settings into the cookies and call apply function.
   */
  saveLocalSettings(localSettings: LocalSettings) {
    // TODO Save into cookies.

    this.localSetttings_ = localSettings;
    this.applyLocalSettings();
  }

  /*
   * Apply local settings in the whole app.
   */
  applyLocalSettings() {
    this.theme_.switchTheme(this.localSetttings_.isThemeDark);
  }
}
