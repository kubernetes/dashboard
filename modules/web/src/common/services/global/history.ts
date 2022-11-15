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

import {Injectable, Injector} from '@angular/core';
import {Navigation, NavigationEnd, Router} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';

@Injectable()
export class HistoryService {
  private router_: Router;
  private previousStateUrl_: string;
  private currentStateUrl_: string;

  constructor(private readonly injector_: Injector) {}

  /** Initializes the service. Must be called before use. */
  init(): void {
    this.router_ = this.injector_.get(Router);

    this.router_.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .pipe(pairwise())
      .subscribe((e: [NavigationEnd, NavigationEnd]) => {
        if (e[0].url !== e[1].url) {
          this.previousStateUrl_ = e[0].url;
          this.currentStateUrl_ = e[1].url;
        }
      });
  }

  pushState(navigation: Navigation): void {
    this.previousStateUrl_ = navigation.extractedUrl.toString();
    this.currentStateUrl_ = navigation.initialUrl.toString();
  }

  /**
   * Goes back to previous state or to the provided defaultState if none set.
   */
  goToPreviousState(defaultState: string): Promise<boolean> {
    if (this.previousStateUrl_ && this.previousStateUrl_ !== this.currentStateUrl_) {
      return this.router_.navigateByUrl(this.previousStateUrl_);
    }

    return this.router_.navigate([defaultState], {queryParamsHandling: 'preserve'});
  }
}
