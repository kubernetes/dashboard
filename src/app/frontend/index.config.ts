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

import {InjectionToken} from '@angular/core';
import {MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {LanguageConfig} from '@api/root.ui';

export const CONFIG_DI_TOKEN = new InjectionToken<Config>('kd.config');

const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    label: 'German',
    value: 'de',
  },
  {
    label: 'French',
    value: 'fr',
  },
  {
    label: 'English',
    value: 'en',
  },
  {
    label: 'Japanese',
    value: 'ja',
  },
  {
    label: 'Korean',
    value: 'ko',
  },
  {
    label: 'Chinese Simplified',
    value: 'zh-Hans',
  },
  {
    label: 'Chinese Traditional',
    value: 'zh-Hant',
  },
  {
    label: 'Chinese Traditional Hong Kong',
    value: 'zh-Hant-HK',
  },
];

export interface Config {
  authTokenCookieName: string;
  skipLoginPageCookieName: string;
  csrfHeaderName: string;
  authTokenHeaderName: string;
  defaultNamespace: string;
  authModeCookieName: string;
  supportedLanguages: LanguageConfig[];
  defaultLanguage: string;
  languageCookieName: string;
}

export const CONFIG: Config = {
  authTokenCookieName: 'jweToken',
  authTokenHeaderName: 'jweToken',
  csrfHeaderName: 'X-CSRF-TOKEN',
  skipLoginPageCookieName: 'skipLoginPage',
  defaultNamespace: 'default',
  authModeCookieName: 'authMode',
  supportedLanguages: SUPPORTED_LANGUAGES,
  defaultLanguage: 'en',
  languageCookieName: 'lang',
};

// Override default material tooltip values.
export const KD_TOOLTIP_DEFAULT_OPTIONS: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 0,
};
