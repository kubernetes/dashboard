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

import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {StateService, TransitionService} from '@uirouter/core';

import {SearchStateParams} from '../../common/params/params';
import {searchState} from '../../search/state';

@Component({selector: 'kd-search', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class SearchComponent implements OnInit {
  query: string;

  constructor(
      private readonly state_: StateService, private readonly transition_: TransitionService) {
    this.query = state_.transition.params('to').q;
  }

  ngOnInit(): void {
    this.transition_.onStart({}, () => {
      this.query = this.state_.transition.params('to').q;
    });
  }

  submit(form: NgForm): void {
    if (form.valid) {
      this.state_.go(searchState.name, new SearchStateParams(this.query));
    }
  }
}
