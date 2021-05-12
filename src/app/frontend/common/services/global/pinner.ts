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
import {PinnedResource} from '@api/root.api';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AlertDialog, AlertDialogConfig} from '../../dialogs/alert/dialog';
import {VerberService} from './verber';

@Injectable()
export class PinnerService {
  onPinUpdate = new Subject();
  private isInitialized_ = false;
  private pinnedResources_: PinnedResource[] = [];
  private readonly endpoint_ = 'api/v1/settings/pinner';

  constructor(
    private readonly dialog_: MatDialog,
    private readonly http_: HttpClient,
    private readonly verber_: VerberService
  ) {}

  init(): void {
    this.load();
    this.onPinUpdate.subscribe(() => this.load());
    this.verber_.onDelete.subscribe(() => this.load());
  }

  load(): void {
    this.http_.get<PinnedResource[]>(this.endpoint_).subscribe(resources => {
      this.pinnedResources_ = resources;
      this.isInitialized_ = true;
    });
  }

  isInitialized(): boolean {
    return this.isInitialized_;
  }

  pin(kind: string, name: string, namespace: string, displayName: string, namespaced?: boolean): void {
    this.http_
      .put(this.endpoint_, {kind, name, namespace, displayName, namespaced})
      .subscribe(() => this.onPinUpdate.next(), this.handleErrorResponse_.bind(this));
  }

  unpin(kind: string, name: string, namespace: string): void {
    let url = `${this.endpoint_}/${kind}`;
    if (namespace !== undefined) {
      url += `/${namespace}`;
    }
    url += `/${name}`;

    this.http_.delete(url).subscribe(() => this.onPinUpdate.next(), this.handleErrorResponse_.bind(this));
  }

  unpinResource(resource: PinnedResource): void {
    this.unpin(resource.kind, resource.name, resource.namespace);
  }

  isPinned(kind: string, name: string, namespace?: string): boolean {
    for (const pinnedResource of this.pinnedResources_) {
      if (pinnedResource.name === name && pinnedResource.kind === kind && pinnedResource.namespace === namespace) {
        return true;
      }
    }
    return false;
  }

  getPinnedForKind(kind: string): PinnedResource[] {
    const resources = [];
    for (const pinnedResource of this.pinnedResources_) {
      if (pinnedResource.kind === kind) {
        resources.push(pinnedResource);
      }
    }

    return resources;
  }

  handleErrorResponse_(err: HttpErrorResponse): void {
    if (err) {
      const alertDialogConfig: MatDialogConfig<AlertDialogConfig> = {
        width: '630px',
        data: {
          title: err.statusText === 'OK' ? 'Internal server error' : err.statusText,
          message: err.error || 'Could not perform the operation.',
          confirmLabel: 'OK',
        },
      };
      this.dialog_.open(AlertDialog, alertDialogConfig);
    }
  }
}
