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

import {
  HookMatchCriteria,
  HookMatchCriterion,
  UIRouter,
} from '@uirouter/core/lib';

import { NAMESPACE_STATE_PARAM } from './common/params/params';
import { AuthService } from './common/services/global/authentication';
import { KdStateService } from './common/services/global/state';
import { TitleService } from './common/services/global/title';
import { CONFIG } from './index.config';

export function configureRouter(router: UIRouter): void {
  const transitionService = router.transitionService;
  const stateService = router.stateService;

  // Register default error handler for state transition errors.
  stateService.defaultErrorHandler(err => {
    stateService.go('error', { error: err });
  });

  // Register transition hook to adjust window title.
  // It cannot be registered "on before" because state params are not available then.
  transitionService.onSuccess({}, transition => {
    const titleService = transition.injector().get(TitleService);
    titleService.update(transition);
  });

  transitionService.onSuccess({}, transition => {
    const namespaceParam = transition.params().namespace;
    if (namespaceParam === undefined && transition.to().name !== 'login') {
      stateService.go(transition.to().name, {
        [NAMESPACE_STATE_PARAM]: CONFIG.defaultNamespace,
      });
    }
  });

  // Register transition hooks for authentication.
  const requiresAuthCriteria = {
    to: (state): HookMatchCriterion => state.data && state.data.requiresAuth,
  } as HookMatchCriteria;

  transitionService.onBefore(
    requiresAuthCriteria,
    transition => {
      const authService = transition.injector().get(AuthService);
      return authService.redirectToLogin(transition);
    },
    { priority: 10 }
  );

  transitionService.onBefore(requiresAuthCriteria, transition => {
    const authService = transition.injector().get(AuthService);
    return authService.refreshToken();
  });

  // Register custom state service to hook state transitions
  transitionService.onBefore({}, transition => {
    const kdStateService = transition.injector().get(KdStateService);
    kdStateService.onBefore.emit(transition);
  });

  transitionService.onSuccess({}, transition => {
    const kdStateService = transition.injector().get(KdStateService);
    kdStateService.onSuccess.emit(transition);
  });
}
