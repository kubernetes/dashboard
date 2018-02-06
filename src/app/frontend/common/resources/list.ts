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
import {Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ResourceList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {merge} from 'rxjs/observable/merge';
import {startWith, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs/Subscription';

import {ResourceStateParams} from '../params/params';
import {GlobalServicesModule} from '../services/global/module';
import {SettingsService} from '../services/global/settings';

import {ResourceListService} from './service';

// TODO: NEEDS DOCUMENTATION!!!
export abstract class ResourceListBase<T extends ResourceList, R> implements OnInit, OnDestroy {
  // Base properties
  private data_ = new MatTableDataSource<R>();
  private dataSubscription_: Subscription;
  private settingsService_: SettingsService;

  // Data select properties
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoading = false;
  totalItems = 0;
  itemsPerPage: number;

  constructor(
      private detailStateName_: string, private state_: StateService,
      protected resourceListService_: ResourceListService<T>) {
    this.settingsService_ = GlobalServicesModule.injector.get(SettingsService);
    this.itemsPerPage = this.settingsService_.getItemsPerPage();
  }

  ngOnInit(): void {
    if (this.sort === undefined) {
      throw Error('MatSort has to be defined on a table.');
    }

    if (this.paginator === undefined) {
      throw Error('MatPaginator has to be defined on a table.');
    }

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    this.dataSubscription_ = merge(this.sort.sortChange, this.paginator.page)
                                 .pipe(startWith({}), switchMap<T, T>(() => {
                                         let params = this.sort_();
                                         params = this.paginate_(params);

                                         this.isLoading = true;
                                         return this.resourceListService_.getResourceList(params);
                                       }))
                                 .subscribe((data: T) => {
                                   this.totalItems = data.listMeta.totalItems;
                                   this.isLoading = false;
                                   this.data_.data = this.map(data);
                                 });
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

  private sort_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    return result.set('sortBy', this.getSortBy_());
  }

  private paginate_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    return result.set('itemsPerPage', `${this.settingsService_.getItemsPerPage()}`)
        .set('page', `${this.paginator.pageIndex + 1}`);
  }

  private getSortBy_(): string {
    // Default values.
    let ascending = true;
    let active = 'age';

    if (this.sort.direction) {
      ascending = this.sort.direction === 'asc';
    }

    if (this.sort.active) {
      active = this.sort.active;
    }

    if (active === 'age') {
      ascending = !ascending;
    }

    return `${ascending ? 'a' : 'd'},${this.mapToBackendValue_(active)}`;
  }

  private mapToBackendValue_(sortByColumnName: string): string {
    switch (sortByColumnName) {
      case 'age':
        return 'creationTimestamp';
      default:
        return sortByColumnName;
    }
  }

  abstract map(value: T): R[];
  abstract getDisplayColumns(): string[];
}

export abstract class ResourceListWithStatuses<T extends ResourceList, R> extends
    ResourceListBase<T, R> {
  private errorIcon_ = 'error';
  private warningIcon_ = 'timelapse';
  private successIcon_ = 'check_circle';

  /**
   * Allows to override warning icon.
   */
  setWarningIcon(iconName: string) {
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
