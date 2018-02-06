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

import {Component} from '@angular/core';

@Component({selector: 'kd-search', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class SearchComponent {
  query = '';

  constructor() {}

  clear(): void {
    this.query = '';
  }

  submit(): void {
    // TODO this.state_.go(stateName, {q: this.query});
  }

  //  * TODO Register state change listener to empty search bar with every state change.
  // $onInit() {
  //   this.transitions_.onStart({}, () => {
  //     this.clear();
  //   });
  // }
}
