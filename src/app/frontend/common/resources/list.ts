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
import {OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ResourceList} from '@api/backendapi';
import {Status} from '@api/frontendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {startWith, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs/Subscription';

import {CardListFilterComponent} from '../components/table/filter/component';
import {NamespacedResourceStateParams, ResourceStateParams} from '../params/params';
import {GlobalServicesModule} from '../services/global/module';
import {SettingsService} from '../services/global/settings';

// TODO: NEEDS DOCUMENTATION!!!
export abstract class ResourceListBase<T extends ResourceList, R> implements OnInit, OnDestroy {
  // Base properties
  private readonly data_ = new MatTableDataSource<R>();
  private dataSubscription_: Subscription;
  private readonly settingsService_: SettingsService;

  // Data select properties
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(CardListFilterComponent) filter: CardListFilterComponent;
  isLoading = false;
  totalItems = 0;

  get itemsPerPage(): number {
    return this.settingsService_.getItemsPerPage();
  }

  constructor(private readonly detailStateName_: string, private readonly state_: StateService) {
    this.settingsService_ = GlobalServicesModule.injector.get(SettingsService);
  }

  ngOnInit(): void {
    if (this.sort === undefined) {
      throw Error('MatSort has to be defined on a table.');
    }

    if (this.paginator === undefined) {
      throw Error('MatPaginator has to be defined on a table.');
    }

    if (this.filter === undefined) {
      throw Error('CardListFilter has to be defined on a table.');
    }

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    let timeoutObj: NodeJS.Timer;
    this.dataSubscription_ =
        merge(this.sort.sortChange, this.paginator.page, this.filter.filterEvent)
            .pipe(startWith({}), switchMap<T, T>(() => {
                    let params = this.sort_();
                    params = this.paginate_(params);
                    params = this.filter_(params);

                    // Show loading animation only for long loading data to avoid flickering.
                    timeoutObj = setTimeout(() => {
                      this.isLoading = true;
                    }, 100);

                    return this.getResourceObservable(params);
                  }))
            .subscribe((data: T) => {
              this.totalItems = data.listMeta.totalItems;
              clearTimeout(timeoutObj);
              this.isLoading = false;
              this.data_.data = this.map(data);
            });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription_) {
      this.dataSubscription_.unsubscribe();
    }
  }

  getDetailsHref(resourceName: string, namespace?: string): string {
    let stateParams = new ResourceStateParams(resourceName);
    if (namespace) {
      stateParams = new NamespacedResourceStateParams(namespace, resourceName);
    }

    return this.state_.href(this.detailStateName_, stateParams);
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

    return result.set('itemsPerPage', `${this.itemsPerPage}`)
        .set('page', `${this.paginator.pageIndex + 1}`);
  }

  private filter_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    // TODO: support filtering by different columns
    const filterByQuery = this.filter.query ? `name,${this.filter.query}` : '';
    return result.set('filterBy', filterByQuery);
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
  abstract getResourceObservable(params?: HttpParams): Observable<T>;
  abstract getDisplayColumns(): string[];
}

export abstract class ResourceListWithStatuses<T extends ResourceList, R> extends
    ResourceListBase<T, R> {
  private readonly errorIcon_ = 'error';
  private warningIcon_ = 'timelapse';
  private readonly successIcon_ = 'check_circle';

  private readonly errorIconClassName_ = 'kd-error';
  private readonly successIconClassName_ = 'kd-success';

  /**
   * Allows to override warning icon.
   */
  setWarningIcon(iconName: string): void {
    this.warningIcon_ = iconName;
  }

  getStatus(resource: R): Status {
    if (this.isInErrorState(resource)) {
      return {
        iconName: this.errorIcon_,
        cssClass: {[this.errorIconClassName_]: true},
      } as Status;
    }

    if (this.isInWarningState(resource)) {
      return {
        iconName: this.warningIcon_,
        cssClass: {},
      } as Status;
    }

    if (this.isInSuccessState(resource)) {
      return {
        iconName: this.successIcon_,
        cssClass: {[this.successIconClassName_]: true},
      } as Status;
    }

    return {} as Status;
  }

  abstract isInErrorState(resource: R): boolean;
  abstract isInWarningState(resource: R): boolean;
  abstract isInSuccessState(resource: R): boolean;
}
