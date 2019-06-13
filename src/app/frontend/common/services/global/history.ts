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

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {KdStateService} from './state';

@Injectable()
export class HistoryService {
  private previousStateName: string;
  // private previousStateParams: RawParams;

  constructor(private readonly router_: Router, private readonly kdState_: KdStateService) {
    this.init();
  }

  /** Initializes the service. Must be called before use. */
  init(): void {
    // this.kdState_.onSuccess.subscribe((transition: Transition) => {
    //   this.previousStateName = transition.from().name || '';
    //   this.previousStateParams = transition.params('from');
    // });
  }

  /**
   * Goes back to previous state or to the provided defaultState if none set.
   */
  goToPreviousState(defaultState: string): Promise<boolean> {
    // let targetState = this.previousStateName || defaultState;
    //
    // // If previous state is same as current state then go to default state to avoid loop.
    // if (this.state_.current.name === this.previousStateName) {
    //   targetState = defaultState;
    // }
    return this.router_.navigate([defaultState], {queryParams: undefined});
  }
}
