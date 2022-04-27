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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';

@Component({
  selector: '',
  templateUrl: './template.html',
})
export class LogsDefaultActionbar implements OnInit, OnDestroy {
  isInitialized = false;
  isVisible = false;
  resourceMeta: ResourceMeta;

  private unsubscribe_ = new Subject<void>();

  constructor(private readonly actionbar_: ActionbarService) {}

  ngOnInit(): void {
    this.actionbar_.onInit.pipe(takeUntil(this.unsubscribe_)).subscribe((resourceMeta: ResourceMeta) => {
      this.resourceMeta = resourceMeta;
      this.isInitialized = true;
      this.isVisible = true;
    });

    this.actionbar_.onDetailsLeave.pipe(takeUntil(this.unsubscribe_)).subscribe(() => (this.isVisible = false));
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }
}
