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

import {animate, state, style, transition, trigger} from '@angular/animations';

const DEFAULT_TRANSITION_TIME = '500ms ease-in-out';

export class Animations {
  static easeOut = trigger('easeOut', [
    transition(
        '* => void',
        [
          style({opacity: 1}),
          animate(DEFAULT_TRANSITION_TIME, style({opacity: 0})),
        ]),
  ]);

  static easeInOut = trigger('easeInOut', [
    transition(
        'void => *',
        [
          style({opacity: 0}),
          animate(DEFAULT_TRANSITION_TIME, style({opacity: 1})),
        ]),
    transition(
        '* => void',
        [
          animate(DEFAULT_TRANSITION_TIME, style({opacity: 0})),
        ])
  ]);

  static shrinkOut = trigger('shrinkOut', [
    state('in', style({height: '*'})),
    transition(
        '* => void',
        [
          style({height: '*'}),
          animate(DEFAULT_TRANSITION_TIME, style({height: 0})),
        ])
  ]);
}
