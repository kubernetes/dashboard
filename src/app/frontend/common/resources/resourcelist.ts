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

import {DataSource} from '@angular/cdk/collections';
import {OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {ResourceStateParams} from '../params/params';

export abstract class ResourceListBase<T> implements OnInit, OnDestroy {
  private data_ = new MatTableDataSource<T>();
  private dataSubscription_: Subscription;

  constructor(
      private detailStateName_: string, private state_: StateService,
      private dataSource_: Observable<T[]>) {}

  ngOnInit() {
    this.dataSubscription_ = this.dataSource_.subscribe(data => this.data_.data = data);
  }

  ngOnDestroy() {
    this.dataSubscription_.unsubscribe();
  }

  abstract getDisplayedColumns(): string[];

  getDetailsHref(resourceName: string): string {
    return this.state_.href(this.detailStateName_, new ResourceStateParams(resourceName));
  }

  getData(): DataSource<T> {
    return this.data_;
  }
}

export abstract class ResourceListWithStatuses<T> extends ResourceListBase<T> {
  private errorIcon_ = 'error';
  private warningIcon_ = 'timelapse';
  private successIcon_ = 'check_circle';

  /**
   * Allows to override warning icon.
   */
  setWarningIcon(iconName: string) {
    this.warningIcon_ = iconName;
  }

  abstract isInErrorState(resource: T): boolean;
  abstract isInWarningState(resource: T): boolean;
  abstract isInSuccessState(resource: T): boolean;

  getIcon(resource: T): string {
    if (this.isInErrorState(resource)) {
      return this.errorIcon_;
    }

    if (this.isInWarningState(resource)) {
      return this.warningIcon_;
    }

    if (this.isInSuccessState(resource)) {
      return this.successIcon_;
    }
  }
}
