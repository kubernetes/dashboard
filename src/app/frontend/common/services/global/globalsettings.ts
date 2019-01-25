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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GlobalSettings} from '@api/backendapi';
import {onSettingsFailCallback, onSettingsLoadCallback} from '@api/frontendapi';
import {Observable} from 'rxjs/Observable';

import {AuthorizerService} from './authorizer';

@Injectable()
export class GlobalSettingsService {
  private readonly endpoint_ = 'api/v1/settings/global';
  private settings_: GlobalSettings = {
    itemsPerPage: 10,
    clusterName: '',
    autoRefreshTimeInterval: 5,
  };
  private isInitialized_ = false;

  constructor(private readonly http_: HttpClient, private readonly authorizer_: AuthorizerService) {
  }

  init(): void {
    this.load();
  }

  isInitialized(): boolean {
    return this.isInitialized_;
  }

  load(onLoad?: onSettingsLoadCallback, onFail?: onSettingsFailCallback): void {
    this.authorizer_.proxyGET<GlobalSettings>(this.endpoint_)
        .toPromise()
        .then(
            (settings) => {
              this.settings_ = settings;
              this.isInitialized_ = true;
              if (onLoad) onLoad(settings);
            },
            (err) => {
              this.isInitialized_ = false;
              if (onFail) onFail(err);
            });
  }

  save(settings: GlobalSettings): Observable<GlobalSettings> {
    const httpOptions = {
      method: 'PUT',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http_.put<GlobalSettings>(this.endpoint_, settings, httpOptions);
  }

  getClusterName(): string {
    return this.settings_.clusterName;
  }

  getItemsPerPage(): number {
    return this.settings_.itemsPerPage;
  }

  getAutoRefreshTimeInterval(): number {
    return this.settings_.autoRefreshTimeInterval;
  }
}
