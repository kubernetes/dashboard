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

import {Injectable, NgModuleFactory} from '@angular/core';

import {PLUGIN_EXTERNALS_MAP} from './pluginexternals';
import {PluginLoaderService} from './pluginloader.service';
import {PluginsConfigService} from '../global/plugin';

const systemJS = window.System;

@Injectable()
export class ClientPluginLoaderService extends PluginLoaderService {
  constructor(private pluginsConfigService_: PluginsConfigService) {
    super();
  }

  provideExternals() {
    Object.keys(PLUGIN_EXTERNALS_MAP).forEach(externalKey =>
      window.define(externalKey, [], () => {
        // @ts-ignore
        return PLUGIN_EXTERNALS_MAP[externalKey];
      })
    );
  }

  load<T>(pluginName: string): Promise<NgModuleFactory<T>> {
    const plugins = this.pluginsConfigService_.pluginsMetadata();
    const plugin = plugins.find(p => p.name === pluginName);
    if (!plugin) {
      throw Error($localize`Can't find plugin "${pluginName}"`);
    }

    const depsPromises = (plugin.dependencies || []).map(dep => {
      const dependency = plugins.find(d => d.name === dep);
      if (!dependency) {
        throw Error($localize`Can't find dependency "${dep}" for plugin "${pluginName}"`);
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
