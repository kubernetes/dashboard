import {Injectable, NgModuleFactory} from '@angular/core';

import {PLUGIN_EXTERNALS_MAP} from './pluginexternals';
import {PluginLoaderService} from './pluginloader.service';
import {PluginsConfigProvider} from './pluginsconfig.provider';

const systemJS = window.System;

@Injectable()
export class ClientPluginLoaderService extends PluginLoaderService {
  constructor(private configProvider: PluginsConfigProvider) {
    super();
  }

  provideExternals() {
    Object.keys(PLUGIN_EXTERNALS_MAP).forEach(externalKey => window.define(externalKey, [], () => {
      // @ts-ignore
      return PLUGIN_EXTERNALS_MAP[externalKey];
    }));
  }

  load<T>(pluginName: string): Promise<NgModuleFactory<T>> {
    const {config} = this.configProvider;
    const plugin = config.items.find(p => p.name === pluginName);
    if (!plugin) {
      throw Error(`Can't find plugin "${pluginName}"`);
    }

    const depsPromises = (plugin.dependencies || []).map(dep => {
      const dependency = config.items.find(d => d.name === dep);
      if (!dependency) {
        throw Error(`Can't find dependency "${dep}" for plugin "${pluginName}"`);
      }

      return systemJS.import(dependency.path).then(m => {
        window['define'](dep, [], () => m.default);
      });
    });

    return Promise.all(depsPromises).then(() => {
      return systemJS.import(plugin.path).then(module => module.default.default);
    });
  }
}
