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

import {UIRouter} from '@uirouter/angular';
import {HookMatchCriteria, HookMatchCriterion} from '@uirouter/core';

import {AuthService} from './common/services/global/authentication';
import {TitleService} from './common/services/global/title';

export function configureRouter(router: UIRouter): void {
  const transitionService = router.transitionService;
  const stateService = router.stateService;

  // Register default error handler for state transition errors.
  stateService.defaultErrorHandler((err) => {
    stateService.go('error', {error: err});
  });

  // Register transition hook to adjust window title.
  transitionService.onBefore({}, (transition) => {
    const titleService = transition.injector().get(TitleService);
    titleService.setTitle(transition);
  });

  // Register transition hooks for authentication.
  const requiresAuthCriteria = {
    to: (state): HookMatchCriterion => state.data && state.data.requiresAuth
  } as HookMatchCriteria;

  transitionService.onBefore(requiresAuthCriteria, (transition) => {
    const authService = transition.injector().get(AuthService);
    return authService.redirectToLogin(transition);
  }, {priority: 10});

  transitionService.onBefore(requiresAuthCriteria, (transition) => {
    const authService = transition.injector().get(AuthService);
    return authService.refreshToken();
  });
}
