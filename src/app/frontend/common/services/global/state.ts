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

import { EventEmitter, Injectable } from '@angular/core';
import { Transition } from '@uirouter/core';
import { NamespaceService } from './namespace';

@Injectable()
export class KdStateService {
  onBefore = new EventEmitter<Transition>();
  onSuccess = new EventEmitter<Transition>();

  constructor(private readonly namespaceService_: NamespaceService) {}

  href(stateName: string, resourceName?: string, namespace?: string): string {
    resourceName = resourceName || '';
    namespace = namespace || '';

    if (namespace && resourceName === undefined) {
      throw new Error('Namespace can not be defined without resourceName.');
    }

    let href = `#/${stateName}`;
    href = namespace ? `${href}/${namespace}` : href;
    href = resourceName ? `${href}/${resourceName}` : href;

    return `${href}?namespace=${this.namespaceService_.current()}`;
  }
}
