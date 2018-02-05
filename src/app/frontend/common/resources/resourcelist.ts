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

export abstract class ResourceList<T> implements OnInit, OnDestroy {
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
