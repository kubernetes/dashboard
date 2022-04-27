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
import {ActivatedRoute} from '@angular/router';
import {StateError} from '@api/root.ui';
import {map} from 'rxjs/operators';

import {KdError} from '@common/errors/errors';

@Component({
  selector: 'kd-error',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class ErrorComponent implements OnInit {
  private error_: KdError;

  constructor(private readonly route_: ActivatedRoute) {}

  ngOnInit(): void {
    this.route_.paramMap.pipe(map(() => window.history.state)).subscribe((state: StateError) => {
      if (state.error) {
        this.error_ = state.error;
      }
    });
  }

  getErrorStatus(): string {
    if (this.error_) {
      return `${this.error_.status} (${this.error_.code})`;
    }

    return 'Unknown Error';
  }

  getErrorData(): string {
    if (this.error_) {
      return this.error_.message;
    }

    return 'No error data available.';
  }
}
