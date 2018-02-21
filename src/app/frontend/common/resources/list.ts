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
import {EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Resource, ResourceList} from '@api/backendapi';
import {OnListChangeEvent} from '@api/frontendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {delay, startWith, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs/Subscription';

import {searchState} from '../../search/state';
import {CardListFilterComponent} from '../components/resourcelist/filter/component';
import {NamespacedResourceStateParams, ResourceStateParams, SEARCH_QUERY_STATE_PARAM} from '../params/params';
import {GlobalServicesModule} from '../services/global/module';
import {SettingsService} from '../services/global/settings';

// TODO: NEEDS DOCUMENTATION!!!
export abstract class ResourceListBase<T extends ResourceList, R> implements OnInit, OnDestroy {
  // Base properties
  private readonly data_ = new MatTableDataSource<R>();
  private dataSubscription_: Subscription;
  private readonly settingsService_: SettingsService;
  @Output('onchange') onChange: EventEmitter<OnListChangeEvent> = new EventEmitter();
  @Input() id: string;
  @Input() groupId: string;
  @Input() hideable = false;

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
    if (!this.id) {
      throw Error('ID is a required attribute of list component.');
    }

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
    this.dataSubscription_ =
        merge(this.sort.sortChange, this.paginator.page, this.filter.filterEvent)
            .pipe(startWith({}), switchMap<T, T>(() => {
                    let params = this.sort_();
                    params = this.paginate_(params);
                    params = this.filter_(params);
                    params = this.search_(params);

                    this.isLoading = true;
                    return this.getResourceObservable(params);
                  }))
            .subscribe((data: T) => {
              this.totalItems = data.listMeta.totalItems;
              this.isLoading = false;
              this.data_.data = this.map(data);
              this.onListChange_();
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

  showZeroState(): boolean {
    return this.totalItems === 0 && !this.isLoading;
  }

  isHidden(): boolean {
    return this.hideable && !this.filtered_() && this.showZeroState();
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

  /**
   * Handles local filtering and search.
   */
  private filter_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    // TODO: support filtering by different columns
    const filterByQuery = this.filter.query ? `name,${this.filter.query}` : '';
    if (filterByQuery) {
      return result.set('filterBy', filterByQuery);
    }

    return result;
  }

  private search_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    // TODO Ensure it works with namespaces.
    // TODO Rework to put only one call to backend? Or is it better like this (no additional endp.)?
    let filterByQuery = result.get('filterBy') || '';
    if (this.state_.current.name === searchState.name) {
      const query = this.state_.params[SEARCH_QUERY_STATE_PARAM];
      if (query) {
        if (filterByQuery) {
          filterByQuery += ',';
        }
        filterByQuery += `name,${query}`;
      }
    }

    if (filterByQuery) {
      return result.set('filterBy', filterByQuery);
    }

    return result;
  }

  private filtered_(): boolean {
    return !!this.filter_().get('filterBy');
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

  private onListChange_(): void {
    this.onChange.emit({
      id: this.id,
      groupId: this.groupId,
      items: this.totalItems,
      filtered: this.filtered_(),
    });
  }

  abstract map(value: T): R[];
  abstract getResourceObservable(params?: HttpParams): Observable<T>;
  abstract getDisplayColumns(): string[];
}

export abstract class ResourceListWithStatuses<T extends ResourceList, R extends Resource> extends
    ResourceListBase<T, R> {
  private readonly bindings_: {[hash: number]: StateBinding<R>} = {};
  private lastHash_: number;
  protected icon = IconName;
  private readonly unknownStatus: StatusIcon = {
    iconName: 'help',
    iconClass: {'': true},
  };

  protected registerBinding(
      iconName: IconName, iconClass: string, callbackFunction: StatusCheckCallback<R>): void {
    const icon = new Icon(String(iconName), iconClass);
    this.bindings_[icon.hash()] = {icon, callbackFunction};
  }

  getStatus(resource: R): StatusIcon {
    if (this.lastHash_) {
      const stateBinding = this.bindings_[this.lastHash_];
      if (stateBinding.callbackFunction(resource)) {
        return this.getStatusObject_(stateBinding);
      }
    }

    // map() is needed here to cast hash from string to number. Without it compiler will not
    // recognize stateBinding type.
    for (const hash of Object.keys(this.bindings_).map((hash): number => Number(hash))) {
      const stateBinding = this.bindings_[hash];
      if (stateBinding.callbackFunction(resource)) {
        this.lastHash_ = Number(hash);
        return this.getStatusObject_(stateBinding);
      }
    }

    return this.unknownStatus;
  }

  private getStatusObject_(stateBinding: StateBinding<R>): StatusIcon {
    return {
      iconName: stateBinding.icon.name,
      iconClass: {[stateBinding.icon.cssClass]: true},
    };
  }
}

interface StatusIcon {
  iconName: string;
  iconClass: {[className: string]: boolean};
}

enum IconName {
  error = 'error',
  timelapse = 'timelapse',
  checkCircle = 'check_circle',
  help = 'help',
}

class Icon {
  name: string;
  cssClass: string;

  constructor(name: string, cssClass: string) {
    this.name = name;
    this.cssClass = cssClass;
  }

  /**
   * Implementation of djb2 hash function:
   * http://www.cse.yorku.ca/~oz/hash.html
   */
  hash(): number {
    const value = `${this.name}#${this.cssClass}`;
    return value.split('')
        .map((str) => {
          return str.charCodeAt(0);
        })
        .reduce((prev, curr) => {
          return ((prev << 5) + prev) + curr;
        }, 5381);
  }
}

type StatusCheckCallback<T> = (resource: T) => boolean;

type StateBinding<T> = {
  icon: Icon,
  callbackFunction: StatusCheckCallback<T>
};
