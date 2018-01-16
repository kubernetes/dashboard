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

import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AssetsService} from './assets';
import {AuthService} from './auth/service';
import {CsrfTokenService} from './csrftoken';
import {SettingsService} from './settings';
import {TitleService} from './title';

@NgModule({
  providers: [
    AssetsService, SettingsService, TitleService, AuthService, CsrfTokenService, {
      provide: APP_INITIALIZER,
      useFactory: init,
      deps: [SettingsService],
      multi: true,
    }
  ],
})
export class GlobalServicesModule {}

export function init(settings: SettingsService) {
  return () => {
    settings.init();
  };
}
