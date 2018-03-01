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
import {StateService} from '@uirouter/core';

import {K8SError, KdError} from '../common/errors/errors';
import {ErrorStateParams} from '../common/params/params';
import {NavService} from '../common/services/nav/service';

@Component({selector: 'kd-error', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class ErrorComponent implements OnInit {
  private error_: KdError|K8SError;
  constructor(private readonly nav_: NavService, private readonly state_: StateService) {
    this.nav_.setVisibility(false);
  }

  ngOnInit(): void {
    this.error_ = (this.state_.params as ErrorStateParams).error;
  }

  getErrorStatus(): string {
    if (this.error_ instanceof K8SError) {
      return (this.error_ as K8SError).ErrStatus.status;
    }

    if (this.error_ instanceof KdError) {
      const error = (this.error_ as KdError);
      return `${error.status} (${error.code})`;
    }

    return 'Unknown Error';
  }

  getErrorData(): string {
    if (this.error_ instanceof K8SError) {
      return (this.error_ as K8SError).ErrStatus.message;
    }

    if (this.error_ instanceof KdError) {
      return (this.error_ as KdError).message;
    }

    return 'No error data available.';
  }
}
