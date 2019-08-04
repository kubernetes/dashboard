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

interface PluginMetadata {
  name: string;
  path: string;
  dependencies: string[];
}

interface PluginsConfig {
  status: number;
  plugins: PluginMetadata[];
  errors?: object[];
}

@Injectable()
export class PluginsConfigProvider {
  config: PluginsConfig = {status: 200, plugins: [], errors: []};

  constructor(private http_: HttpClient) {}

  loadConfig() {
    return this.http_.get<PluginsConfig>(`api/v1/plugin/config`);
  }
}
