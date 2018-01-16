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
import {UIRouter, UIRouterModule} from '@uirouter/angular';

import {aboutState} from '../about/state';
import {TitleService} from '../common/services/global/title';
import {loginState} from '../login/state';
import {SharedModule} from '../shared.module';

import {ChromeComponent} from './component';
import {NavModule} from './nav/module';
import {chromeState} from './state';

@NgModule({
  declarations: [ChromeComponent],
  imports: [
    SharedModule,
    UIRouterModule.forRoot({
      states: [chromeState, loginState],
      useHash: true,
      otherwise: {state: aboutState.name},
      config: configureRouter,
    }),
    // Application modules
    NavModule,
  ]
})
export class ChromeModule {}

export function configureRouter(router: UIRouter) {
  const transitionService = router.transitionService;

  // Register transition hook to adjust window title.
  transitionService.onBefore({}, (transition) => {
    const titleService = transition.injector().get(TitleService);
    titleService.setTitle(transition);
  });
}
