import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

interface PluginsConfig {
  [key: string]: {
    name: string;
    path: string;
    deps: string[];
  };
}

@Injectable()
export class PluginsConfigProvider {
  config: PluginsConfig;

  constructor(
    private http_: HttpClient,
    @Inject(PLATFORM_ID) private platformId: {},
    @Inject('APP_BASE_URL') @Optional() private readonly baseUrl: string
  ) {
    if (isPlatformBrowser(platformId)) {
      this.baseUrl = document.location.origin;
    }
  }

  loadConfig() {
    return this.http_.get<PluginsConfig>(
      `${this.baseUrl}/static/plugins.json`
    );
  }
}
