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
import {AppConfig} from '@api/root.ui';
import {tap} from 'rxjs/operators';
import {lastValueFrom} from 'rxjs';

@Injectable()
export class LocalConfigLoaderService {
  private appConfig_: AppConfig = {} as AppConfig;

  constructor(private readonly http_: HttpClient) {}

  get appConfig(): AppConfig {
    return this.appConfig_;
  }

  init(): Promise<object> {
    return lastValueFrom(
      this.http_.get('assets/config/config.json').pipe(tap(response => (this.appConfig_ = response as AppConfig)))
    );
  }
}
