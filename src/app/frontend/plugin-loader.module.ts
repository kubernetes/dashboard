import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, Inject, NgModule, Optional, SkipSelf} from '@angular/core';

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
