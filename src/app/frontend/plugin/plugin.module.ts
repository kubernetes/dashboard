import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {ClientPluginLoaderService} from '../common/services/pluginloader/clientloader.service';
import {PluginLoaderService} from '../common/services/pluginloader/pluginloader.service';
import {PluginsConfigProvider} from '../common/services/pluginloader/pluginsconfig.provider';

import {PluginComponent} from './plugin.component';

@NgModule({
  imports: [HttpClientModule],
  declarations: [PluginComponent],
  providers: [
    {provide: PluginLoaderService, useClass: ClientPluginLoaderService}, PluginsConfigProvider, {
      provide: APP_INITIALIZER,
      useFactory: (provider: PluginsConfigProvider) =>
          provider.loadConfig().toPromise().then(config => (provider.config = config)),
      multi: true,
      deps: [PluginsConfigProvider]
    }
  ]
})
export class PluginModule {
}
