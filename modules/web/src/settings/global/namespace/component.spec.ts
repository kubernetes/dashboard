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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Controls, NamespaceSettings, NamespaceSettingsComponent} from './component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormArray, FormBuilder, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {SettingsEntryComponent} from '../../entry/component';
import {ResourceService} from '@common/services/resource/resource';
import {NamespaceList} from '@api/root.api';
import {SettingsHelperService} from '../service';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {BreakpointObserver} from '@angular/cdk/layout';
import {HttpClientModule} from '@angular/common/http';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FilterByPipe} from '@common/pipes/filterby';
import {MatIconModule} from '@angular/material/icon';
import {of} from 'rxjs';
import {MatChipsModule} from '@angular/material/chips';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('NamespaceSettingsComponent', () => {
  let component: NamespaceSettingsComponent;
  let fixture: ComponentFixture<NamespaceSettingsComponent>;
  const resourceServiceMock: any = {get: jest.fn()};
  let dialog: MatDialog;
  let setSettings: jest.SpyInstance;
  beforeEach(async () => {
    resourceServiceMock.get.mockReturnValue(of());
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatIconModule,
        MatChipsModule,
        NoopAnimationsModule,
      ],
      declarations: [NamespaceSettingsComponent, SettingsEntryComponent, FilterByPipe],
      providers: [
        {provide: ResourceService<NamespaceList>, useValue: resourceServiceMock},
        {provide: SettingsHelperService},
        {provide: MatDialog},
        {provide: BreakpointObserver},
        {provide: FormBuilder},
        {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: NamespaceSettingsComponent},
      ],
    }).compileComponents();
    dialog = TestBed.inject(MatDialog);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NamespaceSettingsComponent);
    component = fixture.componentInstance;
    setSettings = jest.spyOn(SettingsHelperService.prototype, 'settings', 'set');
    fixture.detectChanges();
  });

  afterEach(() => {
    setSettings.mockClear();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test `NG_VALUE_ACCESSOR` binding from global setting
   * <kd-namespace-settings
   *  >>>>>> [formControlName]="Controls.NamespaceSettings"  <<<<<<<
   *  >
   * </kd-namespace-settings>
   */
  describe('should update form when ControlValueAccessor#writeValue', () => {
    const cases: [any, NamespaceSettings, boolean][] = [
      ['', {defaultNamespace: '', fallbackList: []}, false],
      [null, {defaultNamespace: '', fallbackList: []}, false],
      [undefined, {defaultNamespace: '', fallbackList: []}, false],
      [NaN, {defaultNamespace: '', fallbackList: []}, false],
      [{}, {defaultNamespace: '', fallbackList: []}, false],
      [[], {defaultNamespace: '', fallbackList: []}, false],
      [
        {defaultNamespace: 'default', fallbackList: ['default']},
        {defaultNamespace: 'default', fallbackList: ['default']},
        true,
      ],
      [
        {defaultNamespace: 'default', fallbackList: ['default', 'kubernetes-dashboard']},
        {defaultNamespace: 'default', fallbackList: ['default', 'kubernetes-dashboard']},
        true,
      ],
    ];
    it.each(cases)(
      "when the input is '%p', the value should be %p",
      (setting: any, expectedValue: NamespaceSettings, expectedCall: boolean) => {
        // When
        component.writeValue(setting);
        // Then
        expect(component.form.value).toEqual(expectedValue);
        expectedCall
          ? expect(setSettings).toHaveBeenNthCalledWith(1, {
              defaultNamespace: expectedValue.defaultNamespace,
              namespaceFallbackList: expectedValue.fallbackList,
            })
          : expect(setSettings).toHaveBeenCalledTimes(0);
      }
    );
  });

  it('should update setting when namespaces removed after edit()', () => {
    // Given
    component.form.get(Controls.DefaultNamespace).setValue('default', {emitEvent: false});
    (<FormArray>component.form.get(Controls.FallbackList)).push(new FormControl('default'), {emitEvent: false});
    (<FormArray>component.form.get(Controls.FallbackList)).push(new FormControl('kubernetes-dashboard'), {
      emitEvent: false,
    });
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(['default']),
    } as MatDialogRef<typeof component>);
    // When
    component.edit();
    // Then
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(component.form.value).toEqual({defaultNamespace: 'default', fallbackList: ['default']});
    expect(setSettings).toHaveBeenNthCalledWith(1, {defaultNamespace: 'default', namespaceFallbackList: ['default']});
  });

  it('should update setting when namespace added after add()', () => {
    // Given
    component.form.get(Controls.DefaultNamespace).setValue('default', {emitEvent: false});
    (<FormArray>component.form.get(Controls.FallbackList)).push(new FormControl('default'), {emitEvent: false});
    (<FormArray>component.form.get(Controls.FallbackList)).push(new FormControl('kubernetes-dashboard'), {
      emitEvent: false,
    });
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of('newNamespace'),
    } as MatDialogRef<typeof component>);
    // When
    component.add();
    // Then
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(component.form.value).toEqual({
      defaultNamespace: 'default',
      fallbackList: ['default', 'kubernetes-dashboard', 'newNamespace'],
    });
    expect(setSettings).toHaveBeenNthCalledWith(1, {
      defaultNamespace: 'default',
      namespaceFallbackList: ['default', 'kubernetes-dashboard', 'newNamespace'],
    });
  });
});
