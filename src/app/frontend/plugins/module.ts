import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, Inject, NgModule, Optional, SkipSelf} from '@angular/core';

import {ClientPluginLoaderService} from '../common/services/pluginloader/clientloader.service';
import {PluginLoaderService} from '../common/services/pluginloader/pluginloader.service';
import {PluginsConfigProvider} from '../common/services/pluginloader/pluginsconfig.provider';

import {PluginComponent} from './component';
import {PluginsRoutingModule} from './routing';

@NgModule({
  imports: [HttpClientModule, PluginsRoutingModule],
  declarations: [PluginComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (provider: PluginsConfigProvider) => () =>
          provider.loadConfig().toPromise().then(config => {
            console.log('promise resolved');
            (provider.config = config);
          }),
      multi: true,
      deps: [PluginsConfigProvider]
    },
    PluginsConfigProvider,
    {provide: PluginLoaderService, useClass: ClientPluginLoaderService},
  ]
})
export class PluginsModule {
  constructor(@Inject(PluginsModule) @Optional() @SkipSelf() parentModule: PluginsModule) {
    if (parentModule) {
      throw new Error('PluginsModule is already loaded. Import only in RootModule.');
    }
  }
}
