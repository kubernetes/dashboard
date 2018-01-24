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

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UIRouterModule} from '@uirouter/angular';

import {ChromeModule} from './chrome/module';
import {chromeState} from './chrome/state';
import {CoreModule} from './core.module';
import {RootComponent} from './index.component';
import {configureRouter} from './index.router.config';
import {LoginModule} from './login/module';
import {loginState} from './login/state';
import {overviewState} from './overview/state';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    ChromeModule,
    LoginModule,
    UIRouterModule.forRoot({
      states: [chromeState, loginState],
      useHash: true,
      otherwise: {state: overviewState.name},
      config: configureRouter,
    }),
  ],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
