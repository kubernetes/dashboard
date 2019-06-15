import {Injectable, NgModuleFactory} from '@angular/core';

@Injectable()
export abstract class PluginLoaderService {
  protected constructor() {
    this.provideExternals();
  }

  abstract provideExternals(): void;

  abstract load<T>(pluginName: string): Promise<NgModuleFactory<T>>;
}
