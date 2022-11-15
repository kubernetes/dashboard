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

import {EventEmitter, Injectable} from '@angular/core';
import {Event, NavigationEnd, NavigationStart, Router} from '@angular/router';

@Injectable()
export class KdStateService {
  onBefore = new EventEmitter();
  onSuccess = new EventEmitter();

  constructor(private readonly router_: Router) {
    this.router_.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.onBefore.emit();
      }

      if (event instanceof NavigationEnd) {
        this.onSuccess.emit();
      }
    });
  }

  href(stateName: string, resourceName?: string, namespace?: string, resourceType?: string): string {
    resourceName = resourceName || '';
    namespace = namespace || '';
    resourceType = resourceType || '';

    if (namespace && resourceName === undefined) {
      throw new Error('Namespace can not be defined without resourceName.');
    }

    let href = `/${stateName}`;
    href = namespace ? `${href}/${namespace}` : href;
    href = resourceName ? `${href}/${resourceName}` : href;
    href = resourceType ? `${href}/${resourceType}` : href;

    return href;
  }
}
