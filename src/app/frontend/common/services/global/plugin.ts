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
import {PluginMetadata, PluginsConfig} from '@api/root.ui';
import {Observable} from 'rxjs';

@Injectable()
export class PluginsConfigService {
  private readonly pluginConfigPath_ = 'api/v1/plugin/config';
  private config_: PluginsConfig = {status: 204, plugins: [], errors: []};

  constructor(private readonly http: HttpClient) {}

  init(): Promise<PluginsConfig> {
    return this.fetchConfig();
  }

  refreshConfig(): void {
    this.fetchConfig();
  }

  private fetchConfig(): Promise<PluginsConfig> {
    return this.getConfig()
      .toPromise()
      .then(config => (this.config_ = config));
  }

  private getConfig(): Observable<PluginsConfig> {
    return this.http.get<PluginsConfig>(this.pluginConfigPath_);
  }

  pluginsMetadata(): PluginMetadata[] {
    return this.config_.plugins;
  }

  status(): number {
    return this.config_.status;
  }
}
