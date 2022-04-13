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

import {Status} from '@api/root.api';
import {RatioItem} from '@api/root.ui';

export enum ResourceRatioModes {
  Default = 'default',
  Suspendable = 'suspendable',
  Completable = 'completable',
}

export class Helper {
  static getResourceRatio(status: Status, totalItems: number, mode = ResourceRatioModes.Default): RatioItem[] {
    if (totalItems === 0) {
      return [];
    }

    let items = [
      {
        name: $localize`Running: ${status.running}`,
        value: (status.running / totalItems) * 100,
      },
    ];

    switch (mode) {
      case ResourceRatioModes.Suspendable:
        items.push({
          name: $localize`Suspended: ${status.failed}`,
          value: (status.failed / totalItems) * 100,
        });
        break;
      case ResourceRatioModes.Completable:
        items = items.concat([
          {
            name: $localize`Failed: ${status.failed}`,
            value: (status.failed / totalItems) * 100,
          },
          {
            name: $localize`Pending: ${status.pending}`,
            value: (status.pending / totalItems) * 100,
          },
          {
            name: $localize`Succeeded: ${status.succeeded}`,
            value: (status.succeeded / totalItems) * 100,
          },
        ]);
        break;
      default:
        items = items.concat([
          {
            name: $localize`Failed: ${status.failed}`,
            value: (status.failed / totalItems) * 100,
          },
          {
            name: $localize`Pending: ${status.pending}`,
            value: (status.pending / totalItems) * 100,
          },
        ]);
        break;
    }

    return items;
  }
}
