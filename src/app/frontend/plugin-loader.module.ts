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

import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, Inject, NgModule, Optional, SkipSelf} from '@angular/core';

import {AuthInterceptor} from './common/services/global/interceptor';
import {ClientPluginLoaderService} from './common/services/pluginloader/clientloader.service';
import {PluginLoaderService} from './common/services/pluginloader/pluginloader.service';
import {PluginsConfigProvider} from './common/services/pluginloader/pluginsconfig.provider';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (provider: PluginsConfigProvider) => () =>
          provider.loadConfig().toPromise().then(config => {
            (provider.config = config);
          }),
      multi: true,
      deps: [PluginsConfigProvider]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    PluginsConfigProvider,
    {provide: PluginLoaderService, useClass: ClientPluginLoaderService},
  ]
})
export class PluginLoaderModule {
  constructor(@Inject(PluginLoaderModule) @Optional() @SkipSelf() parentModule:
                  PluginLoaderModule) {
    if (parentModule) {
      throw new Error('PluginLoaderModule is already loaded. Import only in RootModule.');
    }
  }
}
