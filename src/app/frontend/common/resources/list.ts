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
import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Router} from '@angular/router';
import {Event as KdEvent, Resource, ResourceList} from '@api/backendapi';
import {
  ActionColumn,
  ActionColumnDef,
  ColumnWhenCallback,
  ColumnWhenCondition,
  OnListChangeEvent,
} from '@api/frontendapi';
import {Subject} from 'rxjs';
import {Observable, ObservableInput} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';

import {CardListFilterComponent} from '../components/list/filter/component';
import {RowDetailComponent} from '../components/list/rowdetail/component';
import {ListIdentifier} from '../components/resourcelist/groupids';
import {SEARCH_QUERY_STATE_PARAM} from '../params/params';
import {GlobalSettingsService} from '../services/global/globalsettings';
import {GlobalServicesModule} from '../services/global/module';
import {NamespaceService} from '../services/global/namespace';
import {NotificationsService} from '../services/global/notifications';
import {ParamsService} from '../services/global/params';
import {KdStateService} from '../services/global/state';

export abstract class ResourceListBase<T extends ResourceList, R extends Resource>
  implements OnInit, OnDestroy {
  // Base properties
  private readonly actionColumns_: Array<ActionColumnDef<ActionColumn>> = [];
  private readonly data_ = new MatTableDataSource<R>();
  private listUpdates_ = new Subject();
  private unsubscribe_ = new Subject<void>();
  private loaded_ = false;
  private readonly dynamicColumns_: ColumnWhenCondition[] = [];
  private paramsService_: ParamsService;
  private router_: Router;
  protected readonly kdState_: KdStateService;
  protected readonly settingsService_: GlobalSettingsService;
  protected readonly namespaceService_: NamespaceService;

  isLoading = false;
  totalItems = 0;

  get itemsPerPage(): number {
    return this.settingsService_.getItemsPerPage();
  }

  @Output('onchange') onChange: EventEmitter<OnListChangeEvent> = new EventEmitter();

  @Input() groupId: string;
  @Input() hideable = false;
  @Input() id: string;

  // Data select properties
  @ViewChild(MatSort, {static: true}) private readonly matSort_: MatSort;
  @ViewChild(MatPaginator, {static: true}) private readonly matPaginator_: MatPaginator;
  @ViewChild(CardListFilterComponent, {static: true})
  private readonly cardFilter_: CardListFilterComponent;

  protected constructor(
    private readonly stateName_: string,
    private readonly notifications_: NotificationsService,
    private readonly cdr_: ChangeDetectorRef,
  ) {
    this.settingsService_ = GlobalServicesModule.injector.get(GlobalSettingsService);
    this.kdState_ = GlobalServicesModule.injector.get(KdStateService);
    this.namespaceService_ = GlobalServicesModule.injector.get(NamespaceService);
    this.paramsService_ = GlobalServicesModule.injector.get(ParamsService);
    this.router_ = GlobalServicesModule.injector.get(Router);
  }

  ngOnInit(): void {
    if (!this.id) {
      throw Error('ID is a required attribute of list component.');
    }

    if (this.matPaginator_ === undefined) {
      throw Error('MatPaginator has to be defined on a table.');
    }

    this.namespaceService_.onNamespaceChangeEvent.subscribe(() => {
      this.isLoading = true;
      this.listUpdates_.next();
    });

    this.paramsService_.onParamChange.subscribe(() => {
      this.isLoading = true;
      this.listUpdates_.next();
    });

    this.getObservableWithDataSelect_()
      .pipe(startWith({}))
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          return this.getResourceObservable(this.getDataSelectParams_());
        }),
      )
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((data: T) => {
        this.notifications_.pushErrors(data.errors);
        this.totalItems = data.listMeta.totalItems;
        this.data_.data = this.map(data);
        this.isLoading = false;
        this.loaded_ = true;
        this.onListChange_(data);

        if (this.cdr_) {
          this.cdr_.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  getDetailsHref(resourceName: string, namespace?: string): string {
    return this.stateName_ ? this.kdState_.href(this.stateName_, resourceName, namespace) : '';
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

  getColumns(): string[] {
    const displayColumns = this.getDisplayColumns();
    const actionColumns = this.actionColumns_.map(col => col.name);

    for (const condition of this.dynamicColumns_) {
      if (condition.whenCallback()) {
        const afterColIdx = displayColumns.indexOf(condition.afterCol);
        displayColumns.splice(afterColIdx + 1, 0, condition.col);
      }
    }

    return displayColumns.concat(...actionColumns);
  }

  getActionColumns(): Array<ActionColumnDef<ActionColumn>> {
    return this.actionColumns_;
  }

  shouldShowColumn(dynamicColName: string): boolean {
    const col = this.dynamicColumns_.find(condition => {
      return condition.col === dynamicColName;
    });
    if (col !== undefined) {
      return col.whenCallback();
    }

    return false;
  }

  protected registerActionColumn<C extends ActionColumn>(name: string, component: Type<C>): void {
    this.actionColumns_.push({
      name: `action-${name}`,
      component,
    } as ActionColumnDef<ActionColumn>);
  }

  protected registerDynamicColumn(
    col: string,
    afterCol: string,
    whenCallback: ColumnWhenCallback,
  ): void {
    this.dynamicColumns_.push({
      col,
      afterCol,
      whenCallback,
    } as ColumnWhenCondition);
  }

  private getObservableWithDataSelect_<E>(): Observable<E> {
    const obsInput = [this.matPaginator_.page] as Array<ObservableInput<E>>;

    if (this.matSort_) {
      this.matSort_.sortChange.subscribe(() => (this.matPaginator_.pageIndex = 0));
      obsInput.push(this.matSort_.sortChange);
    }

    if (this.cardFilter_) {
      this.cardFilter_.filterEvent.subscribe(() => (this.matPaginator_.pageIndex = 0));
      obsInput.push(this.cardFilter_.filterEvent);
    }

    return merge(...obsInput, this.listUpdates_ as Subject<E>);
  }

  private getDataSelectParams_(): HttpParams {
    let params = this.paginate_();

    if (this.matSort_) {
      params = this.sort_(params);
    }

    if (this.cardFilter_) {
      params = this.filter_(params);
    }

    return this.search_(params);
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

    return result
      .set('itemsPerPage', `${this.itemsPerPage}`)
      .set('page', `${this.matPaginator_.pageIndex + 1}`);
  }

  private filter_(params?: HttpParams): HttpParams {
    let result = new HttpParams();
    if (params) {
      result = params;
    }

    const filterByQuery = this.cardFilter_.query ? `name,${this.cardFilter_.query}` : '';
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

    let filterByQuery = result.get('filterBy') || '';
    if (this.router_.routerState.snapshot.url.startsWith('/search')) {
      const query = this.paramsService_.getQueryParam(SEARCH_QUERY_STATE_PARAM);
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

    if (this.matSort_.direction) {
      ascending = this.matSort_.direction === 'asc';
    }

    if (this.matSort_.active) {
      active = this.matSort_.active;
    }

    if (active === 'age') {
      ascending = !ascending;
    }

    return `${ascending ? 'a' : 'd'},${this.mapToBackendValue_(active)}`;
  }

  private mapToBackendValue_(sortByColumnName: string): string {
    return sortByColumnName === 'age' ? 'creationTimestamp' : sortByColumnName;
  }

  private onListChange_(data: T): void {
    const emitValue = {
      id: this.id,
      groupId: this.groupId,
      items: this.totalItems,
      filtered: false,
      resourceList: data,
    } as OnListChangeEvent;

    if (this.cardFilter_) {
      emitValue.filtered = this.filtered_();
    }

    this.onChange.emit(emitValue);
  }

  protected abstract getDisplayColumns(): string[];

  abstract getResourceObservable(params?: HttpParams): Observable<T>;

  abstract map(value: T): R[];
}

export abstract class ResourceListWithStatuses<
  T extends ResourceList,
  R extends Resource
> extends ResourceListBase<T, R> {
  private readonly bindings_: {[hash: number]: StateBinding<R>} = {};
  @ViewChildren('matrow', {read: ViewContainerRef})
  private readonly containers_: QueryList<ViewContainerRef>;
  private lastHash_: number;
  private readonly unknownStatus: StatusIcon = {
    iconName: 'help',
    iconClass: {'': true},
  };

  protected icon = IconName;

  expandedRow: number = undefined;
  hoveredRow: number = undefined;

  protected constructor(
    stateName: string,
    private readonly notifications: NotificationsService,
    cdr: ChangeDetectorRef,
    private readonly resolver_?: ComponentFactoryResolver,
  ) {
    super(stateName, notifications, cdr);

    this.onChange.subscribe(this.clearExpandedRows_.bind(this));
  }

  expand(index: number, resource: R): void {
    if (!this.hasErrors(resource)) {
      return;
    }

    if (this.expandedRow !== undefined) {
      this.containers_.toArray()[this.expandedRow].clear();
    }

    if (this.expandedRow === index) {
      this.expandedRow = undefined;
      return;
    }

    const container = this.containers_.toArray()[index];
    const factory = this.resolver_.resolveComponentFactory(RowDetailComponent);
    const component = container.createComponent(factory);

    component.instance.events = this.getEvents(resource);
    this.expandedRow = index;
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

  isRowExpanded(index: number): boolean {
    return this.expandedRow === index;
  }

  isRowHovered(index: number): boolean {
    return this.hoveredRow === index;
  }

  onRowOver(rowIdx: number): void {
    this.hoveredRow = rowIdx;
  }

  onRowLeave(): void {
    this.hoveredRow = undefined;
  }

  showHoverIcon(index: number, resource: R): boolean {
    return this.isRowHovered(index) && this.hasErrors(resource) && !this.isRowExpanded(index);
  }

  protected getEvents(_resource: R): KdEvent[] {
    return [];
  }

  protected hasErrors(_resource: R): boolean {
    return false;
  }

  protected registerBinding(
    iconName: IconName,
    iconClass: string,
    callbackFunction: StatusCheckCallback<R>,
  ): void {
    const icon = new Icon(String(iconName), iconClass);
    this.bindings_[icon.hash()] = {icon, callbackFunction};
  }

  private clearExpandedRows_(): void {
    const containers = this.containers_.toArray();
    for (let i = 0; i < containers.length; i++) {
      containers[i].clear();
      this.expandedRow = undefined;
    }
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
  warning = 'warning',
  none = '',
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
    return value
      .split('')
      .map(str => {
        return str.charCodeAt(0);
      })
      .reduce((prev, curr) => {
        return (prev << 5) + prev + curr;
      }, 5381);
  }
}

type StatusCheckCallback<T> = (resource: T) => boolean;

type StateBinding<T> = {
  icon: Icon;
  callbackFunction: StatusCheckCallback<T>;
};
