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

import {Inject, NgModule, Optional, SkipSelf} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

import {DialogsModule} from '@common/dialogs/module';
import {GlobalServicesModule} from '@common/services/global/module';
import {ResourceModule} from '@common/services/resource/module';
import {CONFIG, CONFIG_DI_TOKEN} from './index.config';
import {MESSAGES_DI_TOKEN, MESSAGES} from './index.messages';

@NgModule({
  providers: [
    {provide: CONFIG_DI_TOKEN, useValue: CONFIG},
    {provide: MESSAGES_DI_TOKEN, useValue: MESSAGES},
    CookieService,
  ],
  imports: [GlobalServicesModule, DialogsModule, ResourceModule],
})
export class CoreModule {
  /* make sure CoreModule is imported only by one NgModule the RootModule */
  constructor(@Inject(CoreModule) @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in RootModule.');
    }
  }
}
