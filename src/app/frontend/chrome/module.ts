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
import {MatIconRegistry} from '@angular/material';
import {UIRouterModule} from '@uirouter/angular';

import {SharedModule} from '../shared_module';

import {ChromeComponent} from './component';
import {NavModule} from './nav/module';
import {chromeState} from './state';

@NgModule({
  declarations: [ChromeComponent],
  imports: [
    SharedModule,
    UIRouterModule.forRoot({
      states: [chromeState],
      useHash: true,
      otherwise: {state: 'about'},
    }),
    // Application modules
    NavModule,
  ],
  providers: [
    MatIconRegistry,
  ],
})
export class ChromeModule {}
