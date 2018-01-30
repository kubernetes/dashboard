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

import {Error, Settings} from '@api/backendapi';
import {AuthorizerService} from './authorizer';

type onLoadCb = (settings?: Settings) => void;
type onFailCb = (err?: string|Error) => void;

@Injectable()
export class SettingsService {
  private readonly globalSettingsEndpoint_ = 'api/v1/settings/global';
  private globalSettings_: Settings = {
    itemsPerPage: 10,
    clusterName: '',
    autoRefreshTimeInterval: 5,
  };
  private isInitialized_ = false;

  constructor(private http_: HttpClient, private authorizer_: AuthorizerService) {}

  init() {
    this.load();
  }

  isInitialized() {
    return this.isInitialized_;
  }

  load(onLoad?: onLoadCb, onFail?: onFailCb) {
    this.authorizer_.proxyGET<Settings>(this.globalSettingsEndpoint_)
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
}
