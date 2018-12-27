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

import chromeModule from 'chrome/module';
import {namespaceParam} from 'chrome/state';
import {NamespaceChangeInfoDialogController} from 'common/namespace/dialog';
import module from 'common/namespace/module';
import {stateName as overview} from 'overview/state';

describe('Namespace change info dialog ', () => {
  /** @type {!common/namespace/dialog.NamespaceChangeInfoDialogController} */
  let ctrl;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!common/state/service.FutureStateService}*/
  let kdFutureStateService;
  /** @type {!md.$dialog} */
  let mdDialog;

  beforeEach(() => {
    angular.mock.module(module.name);
    angular.mock.module(chromeModule.name);

    angular.mock.inject(($state, _kdFutureStateService_, $mdDialog) => {
      ctrl = new NamespaceChangeInfoDialogController($mdDialog, '', _kdFutureStateService_, $state);
      state = $state;
      kdFutureStateService = _kdFutureStateService_;
      mdDialog = $mdDialog;
    });
  });

  it('should cancel state change and redirect to overview page of current namespace', () => {
    // given
    let currentNamespace = 'namespace-1';
    spyOn(mdDialog, 'cancel');
    spyOn(state, 'go');
    state.params[namespaceParam] = currentNamespace;

    // when
    ctrl.cancel();

    // then
    expect(mdDialog.cancel).toHaveBeenCalled();
    expect(state.go).toHaveBeenCalledWith(overview, {[namespaceParam]: currentNamespace});
  });

  it('should change namespace and reload current page', () => {
    // given
    let newNamespace = 'namespace-2';
    let futureState = {name: overview};
    spyOn(mdDialog, 'hide');
    spyOn(state, 'go');
    ctrl.newNamespace = newNamespace;
    kdFutureStateService.state = futureState;

    // when
    ctrl.changeNamespace();

    // then
    expect(mdDialog.hide).toHaveBeenCalled();
    expect(state.go).toHaveBeenCalledWith(futureState, {[namespaceParam]: newNamespace});
  });

  it('should return current selected namespace', () => {
    // given
    let currentNamespace = 'namespace-1';
    state.params[namespaceParam] = currentNamespace;

    // when
    let result = ctrl.currentNamespace();

    // then
    expect(result).toEqual(currentNamespace);
  });
});
