import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, Optional, PLATFORM_ID} from '@angular/core';

interface PluginsConfig {
  [key: string]: {name: string; path: string; deps: string[];};
}

@Injectable({
  providedIn: 'root',
})
export class PluginsConfigProvider {
  config: PluginsConfig = {};

  constructor(
      private http_: HttpClient, @Inject(PLATFORM_ID) private platformId: {},
      @Inject('APP_BASE_URL') @Optional() private readonly baseUrl: string) {
    console.log('plugin config constructor called');
    if (isPlatformBrowser(platformId)) {
      this.baseUrl = document.location.origin;
    }
  }

  loadConfig() {
    console.log('plugin config network call');
    return this.http_.get<PluginsConfig>(`${this.baseUrl}/static/plugins.json`);
  }
}
