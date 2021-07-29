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

import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, forwardRef, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {GlobalSettings, NamespaceList} from '@api/root.api';
import {Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {SettingsHelperService} from '../service';
import {AddFallbackNamespaceDialog, AddFallbackNamespaceDialogData} from './adddialog/dialog';
import {EditFallbackNamespaceDialog, EditFallbackNamespaceDialogData} from './editdialog/dialog';

enum BreakpointElementCount {
  XLarge = 5,
  Large = 3,
  Medium = 2,
  Small = 2,
}

enum Controls {
  DefaultNamespace = 'defaultNamespace',
  FallbackList = 'fallbackList',
}

interface NamespaceSettings {
  defaultNamespace: string;
  fallbackList: string[];
}

@Component({
  selector: 'kd-namespace-settings',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NamespaceSettingsComponent),
      multi: true,
    },
  ],
})
export class NamespaceSettingsComponent implements OnInit, OnDestroy, ControlValueAccessor {
  readonly Controls = Controls;

  namespaces: string[] = [];
  visibleNamespaces = 0;
  form: FormGroup;

  private settings_: GlobalSettings;
  private readonly endpoint_ = EndpointManager.resource(Resource.namespace).list();
  private readonly unsubscribe_ = new Subject<void>();
  private readonly visibleNamespacesMap: [string, number][] = [
    [Breakpoints.XLarge, BreakpointElementCount.XLarge],
    [Breakpoints.Large, BreakpointElementCount.Large],
    [Breakpoints.Medium, BreakpointElementCount.Medium],
    [Breakpoints.Small, BreakpointElementCount.Small],
  ];

  private get namespaceFallbackList_(): string[] {
    return this.settings_.namespaceFallbackList ? this.settings_.namespaceFallbackList.filter(ns => ns) : [];
  }

  private get formArrayNamespaceFallbackList_(): string[] {
    const arr = this.form.get(Controls.FallbackList).value as string[];
    return arr ? arr.filter(ns => ns) : [];
  }

  constructor(
    private readonly namespaceService_: ResourceService<NamespaceList>,
    private readonly settingsHelperService_: SettingsHelperService,
    private readonly dialog_: MatDialog,
    private readonly breakpointObserver_: BreakpointObserver,
    private readonly builder_: FormBuilder
  ) {}

  get invisibleCount(): number {
    return this.settings_.namespaceFallbackList
      ? this.settings_.namespaceFallbackList.length - this.visibleNamespaces
      : 0;
  }

  ngOnInit(): void {
    this.settings_ = this.settingsHelperService_.settings;

    this.form = this.builder_.group({
      [Controls.DefaultNamespace]: this.builder_.control(''),
      [Controls.FallbackList]: this.builder_.array([]),
    });

    this.namespaceService_
      .get(this.endpoint_)
      .pipe(map(list => list.namespaces.map(ns => ns.objectMeta.name)))
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(namespaces => (this.namespaces = namespaces));

    this.breakpointObserver_
      .observe([Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(result => {
        const breakpoint = this.visibleNamespacesMap.find(breakpoint => result.breakpoints[breakpoint[0]]);
        this.visibleNamespaces = breakpoint ? breakpoint[1] : BreakpointElementCount.Small;
      });

    this.form.valueChanges.pipe(takeUntil(this.unsubscribe_)).subscribe(this.onFormChange_.bind(this));
    this.settingsHelperService_.onSettingsChange
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(this.onSettingsChange_.bind(this));
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  add(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        namespaces: this.namespaces.filter(
          ns => !this.settingsHelperService_.settings.namespaceFallbackList.includes(ns)
        ),
      } as AddFallbackNamespaceDialogData,
    };

    this.dialog_
      .open(AddFallbackNamespaceDialog, dialogConfig)
      .afterClosed()
      .pipe(take(1))
      .subscribe(s => (!this.containsNamespace_(s) ? this.addNamespace_(s) : null));
  }

  edit(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        namespaces: this.namespaceFallbackList_,
      } as EditFallbackNamespaceDialogData,
    };

    this.dialog_
      .open(EditFallbackNamespaceDialog, dialogConfig)
      .afterClosed()
      .pipe(take(1))
      .subscribe((namespaces: string[] | undefined) => {
        if (namespaces) {
          this.settingsHelperService_.settings = {namespaceFallbackList: namespaces} as GlobalSettings;
        }
      });
  }

  // ControlValueAccessor interface implementation
  writeValue(obj: NamespaceSettings): void {
    if (!obj) {
      return;
    }

    this.form.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges.pipe(takeUntil(this.unsubscribe_)).subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.form.statusChanges.pipe(takeUntil(this.unsubscribe_)).subscribe(fn);
  }

  private addNamespace_(ns: string): void {
    (this.form.get(Controls.FallbackList) as FormArray).push(this.builder_.control(ns));
  }

  private containsNamespace_(ns: string): boolean {
    return !ns || (this.form.get(Controls.FallbackList) as FormArray).controls.map(c => c.value).indexOf(ns) > -1;
  }

  private onFormChange_(): void {
    this.settingsHelperService_.settings = {
      defaultNamespace: this.form.get(Controls.DefaultNamespace).value,
      namespaceFallbackList: this.formArrayNamespaceFallbackList_,
    } as GlobalSettings;
  }

  private onSettingsChange_(settings: GlobalSettings): void {
    this.settings_ = settings;

    this.form.get(Controls.DefaultNamespace).setValue(this.settings_.defaultNamespace, {emitEvent: false});

    (this.form.get(Controls.FallbackList) as FormArray).controls = this.namespaceFallbackList_.map(_ =>
      this.builder_.control('')
    );
    (this.form.get(Controls.FallbackList) as FormArray).reset(this.namespaceFallbackList_, {emitEvent: false});
  }
}
