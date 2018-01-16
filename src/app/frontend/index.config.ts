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

import {InjectionToken} from '@angular/core';

export let KD_CONFIG = new InjectionToken<KdConfig>('kd.config');

export class KdConfig {
  tokenCookieName: string;
  skipLoginPageCookieName: string;
  csrfHeaderName: string;
  authTokenHeaderName: string;
}

// TODO fill this out
export const KD_DI_CONFIG: KdConfig = {
  tokenCookieName: 'a',
  skipLoginPageCookieName: 'a',
  csrfHeaderName: 'a',
  authTokenHeaderName: 'a',
};
