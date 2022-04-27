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
import {ActivatedRoute, NavigationEnd, Params, Router} from '@angular/router';
import {combineLatest, Subject} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';

@Injectable()
export class ParamsService {
  onParamChange = new Subject<void>();

  private params_: Params = {};
  private queryParamMap_: Params = {};

  constructor(private router_: Router, private route_: ActivatedRoute) {
    this.router_.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(
        map(() => {
          let active = this.route_;
          while (active.firstChild) {
            active = active.firstChild;
          }

          return active;
        })
      )
      .pipe(switchMap(active => combineLatest([active.params, active.queryParams])))
      .subscribe(([params, queryParams]) => {
        this.copyParams_(params, this.params_);
        this.copyParams_(queryParams, this.queryParamMap_);
        this.onParamChange.next();
      });
  }

  getQueryParam(name: string) {
    return this.queryParamMap_ ? this.queryParamMap_[name] : undefined;
  }

  setQueryParam(name: string, value: string) {
    if (this.queryParamMap_) this.queryParamMap_[name] = value;
  }

  private copyParams_(from: Params, to: Params) {
    for (const key of Object.keys(from)) {
      to[key] = from[key];
    }
  }
}
