import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, Optional, PLATFORM_ID} from '@angular/core';
import {ListMeta, Plugin} from '@api/backendapi';

interface PluginsConfig {
  listMeta: ListMeta;
  plugins: Plugin[];
  errors: string[];
}

@Injectable()
export class PluginsConfigProvider {
  config: PluginsConfig = {listMeta: {totalItems: 0}, plugins: [], errors: []};

  constructor(
      private http_: HttpClient, @Inject(PLATFORM_ID) private platformId: {},
      @Inject('APP_BASE_URL') @Optional() private readonly baseUrl: string) {
    if (isPlatformBrowser(platformId)) {
      this.baseUrl = document.location.origin;
    }
  }

  loadConfig() {
    // TODO: Figure out a way to load plugins from different namespaces
    return this.http_.get<PluginsConfig>(`${this.baseUrl}/api/v1/plugin/default`);
  }
}
