/*
 * Copyright 2017 The Kubernetes Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {EventEmitter, Injectable} from '@angular/core';
import {User} from '@api/root.api';
import {HttpClient} from '@angular/common/http';
import {interval, lastValueFrom, Observable, of} from 'rxjs';
import {catchError, switchMap, take, tap} from 'rxjs/operators';

@Injectable()
export class MeService {
  private readonly _endpoint = 'api/v1/me';
  private _user: User = {authenticated: false} as User;
  private _interval = interval(30_000);
  private _initialized = new EventEmitter<void>(true);

  constructor(private readonly _http: HttpClient) {}

  init(): Promise<void> {
    // Immediately check user
    this.me()
      .pipe(
        take(1),
        catchError(_ => of({authenticated: false} as User))
      )
      .subscribe(me => {
        this._user = me;
        this._initialized.emit();
      });

    // Start interval refresh
    this._interval
      .pipe(
        switchMap(() => this.me()),
        catchError(_ => of({authenticated: false} as User))
      )
      .subscribe(me => (this._user = me));

    return lastValueFrom(this._initialized.pipe(take(1)));
  }

  me(): Observable<User> {
    return this._http.get<User>(this._endpoint);
  }

  getUserName(): string {
    return this._user?.name;
  }

  getUser(): User {
    return this._user;
  }

  reset(): void {
    this._user = {} as User;
  }

  refresh(): Promise<User> {
    return lastValueFrom(
      this.me().pipe(
        take(1),
        tap(user => (this._user = user))
      )
    );
  }
}
