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
import {HttpParams} from '@angular/common/http';
import {AfterViewInit, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {StateService} from '@uirouter/core';
import {merge} from 'rxjs/observable/merge';
import {map, startWith, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs/Subscription';

import {ResourceStateParams} from '../params/params';

import {ResourceListService} from './service';

// TODO: NEEDS DOCUMENTATION!!!
export abstract class ResourceListBase<T, R> implements OnInit, OnDestroy {
  protected data_ = new MatTableDataSource<R>();
  protected dataSubscription_: Subscription;

  constructor(
      private detailStateName_: string, private state_: StateService,
      protected resourceListService_: ResourceListService<T>) {}

  ngOnInit(): void {
    this.dataSubscription_ =
        this.resourceListService_.getResourceList().map<T, R[]>(this.map).subscribe(
            data => this.data_.data = data);
  }

  ngOnDestroy(): void {
    this.dataSubscription_.unsubscribe();
  }

  getDetailsHref(resourceName: string): string {
    return this.state_.href(this.detailStateName_, new ResourceStateParams(resourceName));
  }

  getData(): DataSource<R> {
    return this.data_;
  }

  abstract map(value: T, index: number): R[];
  abstract getDisplayColumns(): string[];
}

export abstract class ResourceListWithStatuses<T, R> extends ResourceListBase<T, R> {
  private errorIcon_ = 'error';
  private warningIcon_ = 'timelapse';
  private successIcon_ = 'check_circle';

  /**
   * Allows to override warning icon.
   */
  setWarningIcon(iconName: string): void {
    this.warningIcon_ = iconName;
  }

  getIcon(resource: R): string {
    if (this.isInErrorState(resource)) {
      return this.errorIcon_;
    }

    if (this.isInWarningState(resource)) {
      return this.warningIcon_;
    }

    if (this.isInSuccessState(resource)) {
      return this.successIcon_;
    }

    return '';
  }

  abstract isInErrorState(resource: R): boolean;
  abstract isInWarningState(resource: R): boolean;
  abstract isInSuccessState(resource: R): boolean;
}

export abstract class ResourceListWithStatusesAndDataSelect<T, R> extends
    ResourceListWithStatuses<T, R> implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoading = false;
  totalItems = 0;

  constructor(
      detailStateName: string, state: StateService, resourceListService: ResourceListService<T>) {
    super(detailStateName, state, resourceListService);
  }

  private getSortBy_(): string {
    let ascending = this.sort.direction === 'asc';
    let active = this.sort.active;
    if (this.sort.active === 'age') {
      active = 'creationTimestamp';
      ascending = !ascending;
    }

    return `${ascending ? 'a' : 'd'},${active}`;
  }

  ngOnInit(): void {
    this.dataSubscription_ = merge(this.sort.sortChange)
                                 .pipe(
                                     startWith({}), switchMap<T, T>(() => {
                                       this.isLoading = true;

                                       let params = new HttpParams();
                                       params = params.set('sortBy', this.getSortBy_());
                                       return this.resourceListService_.getResourceList(params);
                                     }),
                                     map(this.map))
                                 .subscribe(data => this.data_.data = data);
  }

  ngAfterViewInit(): void {}
}
