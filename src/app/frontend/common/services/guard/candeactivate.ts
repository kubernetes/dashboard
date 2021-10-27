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
import {MatDialog} from '@angular/material/dialog';
import {CanDeactivate} from '@angular/router';
import {ConfirmDialog, ConfirmDialogConfig} from '@common/dialogs/config/dialog';
import {ICanDeactivate} from '@common/interfaces/candeactivate';
import {Observable, of} from 'rxjs';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ICanDeactivate> {
  constructor(private readonly dialog_: MatDialog) {}

  canDeactivate(component: ICanDeactivate): Observable<boolean> {
    if (component.canDeactivate()) {
      return of(true);
    }

    const config = {
      title: 'Unsaved changes',
      message: 'The form has not been submitted yet, do you really want to leave?',
    } as ConfirmDialogConfig;

    return this.dialog_.open(ConfirmDialog, {data: config}).afterClosed();
  }
}
