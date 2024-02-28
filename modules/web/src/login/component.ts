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

import {HttpErrorResponse} from '@angular/common/http';
import {Component, Inject, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoginSpec} from '@api/root.api';
import {KdError} from '@api/root.shared';
import {IConfig, StateError} from '@api/root.ui';
import {AsKdError} from '@common/errors/errors';
import {AuthService} from '@common/services/global/authentication';
import {HistoryService} from '@common/services/global/history';
import {map} from 'rxjs/operators';
import {CONFIG_DI_TOKEN} from '../index.config';

@Component({
  selector: 'kd-login',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class LoginComponent implements OnInit {
  errors: KdError[] = [];
  private token_: string;
  constructor(
    private readonly authService_: AuthService,
    private readonly ngZone_: NgZone,
    private readonly route_: ActivatedRoute,
    private readonly historyService_: HistoryService,
    @Inject(CONFIG_DI_TOKEN) private readonly CONFIG: IConfig
  ) {}

  ngOnInit(): void {
    this.route_.paramMap.pipe(map(() => window.history.state)).subscribe((state: StateError) => {
      if (state.error) {
        this.errors = [state.error];
      }
    });
  }

  login(): void {
    this.authService_.login(this.getLoginSpec_()).subscribe({
      next: () => this.ngZone_.run(() => this.historyService_.goToPreviousState('workloads')),
      error: (err: HttpErrorResponse) => (this.errors = [AsKdError(err)]),
    });
  }

  onChange(event: Event): void {
    this.token_ = (event.target as HTMLInputElement).value.trim();
  }

  hasEmptyToken(): boolean {
    return !this.token_ || !this.token_.trim();
  }

  private getLoginSpec_(): LoginSpec {
    return {token: this.token_} as LoginSpec;
  }
}
