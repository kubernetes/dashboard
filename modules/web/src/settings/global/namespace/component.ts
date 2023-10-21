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
import {Component, DestroyRef, forwardRef, inject, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, FormControl, FormArray} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {GlobalSettings, NamespaceList} from '@api/root.api';
import {map, take, tap} from 'rxjs/operators';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {SettingsHelperService} from '../service';
import {AddFallbackNamespaceDialog, AddFallbackNamespaceDialogData} from './adddialog/dialog';
import {EditFallbackNamespaceDialog, EditFallbackNamespaceDialogData} from './editdialog/dialog';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

enum BreakpointElementCount {
  XLarge = 5,
  Large = 3,
  Medium = 2,
}

export enum Controls {
  DefaultNamespace = 'defaultNamespace',
  FallbackList = 'fallbackList',
}

export interface NamespaceSettings {
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
export class NamespaceSettingsComponent implements OnInit, ControlValueAccessor {
  readonly Controls = Controls;

  namespaces: string[] = [];
  visibleNamespaces = 0;
  readonly form: FormGroup = new FormGroup({
    [Controls.DefaultNamespace]: new FormControl(''),
    [Controls.FallbackList]: new FormArray([]),
  });

  private settings_: GlobalSettings;
  private readonly endpoint_ = EndpointManager.resource(Resource.namespace).list();
  private readonly visibleNamespacesMap: [string, number][] = [
    [Breakpoints.XLarge, BreakpointElementCount.XLarge],
    [Breakpoints.Large, BreakpointElementCount.Large],
    [Breakpoints.Medium, BreakpointElementCount.Medium],
  ];

  private get namespaceFallbackList_(): string[] {
    return this.settings_.namespaceFallbackList ? this.settings_.namespaceFallbackList.filter(ns => ns) : [];
  }

  public readonly destroyRef: DestroyRef = inject(DestroyRef);
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

    this.namespaceService_
      .get(this.endpoint_)
      .pipe(map(list => list.namespaces.map(ns => ns.objectMeta.name)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(namespaces => (this.namespaces = namespaces));

    this.breakpointObserver_
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        const breakpoint = this.visibleNamespacesMap.find(breakpoint => result.breakpoints[breakpoint[0]]);
        this.visibleNamespaces = breakpoint ? breakpoint[1] : BreakpointElementCount.Medium;
      });

    this.form.valueChanges
      .pipe(
        tap((next: NamespaceSettings) => {
          this.settingsHelperService_.settings = {
            ...this.settingsHelperService_.settings,
            defaultNamespace: next.defaultNamespace,
            namespaceFallbackList: next.fallbackList,
          };
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
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
          this.removeNamespace_(namespaces);
        }
      });
  }

  private addNamespace_(ns: string): void {
    (<FormArray>this.form.get(Controls.FallbackList)).push(this.builder_.control(ns), {emitEvent: true});
  }

  private removeNamespace_(namespaces: string[]): void {
    const fallbackList = <FormArray>this.form.get(Controls.FallbackList);
    fallbackList.controls = namespaces.map(_ => this.builder_.control(''));
    fallbackList.patchValue(
      namespaces.map(ns => ns),
      {emitEvent: true}
    );
  }

  private containsNamespace_(ns: string): boolean {
    return !ns || (<FormArray>this.form.get(Controls.FallbackList)).controls.map(c => c.value).indexOf(ns) > -1;
  }

  writeValue(obj: any): void {
    if (!obj || !this.isSetting(obj)) {
      return;
    }
    this.form.get(Controls.DefaultNamespace).patchValue(obj.defaultNamespace, {emitEvent: false});
    obj.fallbackList.map((namespace: any) =>
      (<FormArray>this.form.get(Controls.FallbackList)).push(this.builder_.control(namespace), {emitEvent: false})
    );
    this.form.updateValueAndValidity({emitEvent: true});
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched(fn);
  }

  onChange = (_: any) => {};
  onTouched = (_: any) => {};

  private isSetting = (value: any): value is NamespaceSettings => !!value.defaultNamespace && !!value.fallbackList;
}
