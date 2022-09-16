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

import {Component, forwardRef} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import {EnvironmentVariable} from '@api/root.api';

@Component({
  selector: 'kd-environment-variables',
  templateUrl: './template.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnvironmentVariablesComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EnvironmentVariablesComponent),
      multi: true,
    },
  ],
})
export class EnvironmentVariablesComponent implements ControlValueAccessor {
  form: FormGroup;

  namePattern = new RegExp('^[A-Za-z_][A-Za-z0-9_]*$');

  constructor(private readonly fb_: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb_.group({
      variables: this.fb_.array([this.newVariable()]),
    });
    this.form.valueChanges.subscribe(v => {
      this.propagateChange(v);
    });
  }

  validate(_: FormControl): {[key: string]: object} {
    return this.form.valid ? null : {labelValid: {value: this.form.errors}};
  }

  get variables(): FormArray {
    return this.form.get('variables') as FormArray;
  }

  addVariableIfNeeed(): void {
    const last = this.variables.at(this.variables.length - 1);
    if (this.isVariableFilled(last) && last.valid) {
      this.variables.push(this.newVariable());
    }
  }

  private isVariableFilled(variable: AbstractControl): boolean {
    return !!variable.get('name').value;
  }

  private newVariable(): FormGroup {
    return this.fb_.group({
      name: ['', Validators.pattern(this.namePattern)],
      value: '',
    });
  }

  isRemovable(index: number): boolean {
    return index !== this.variables.length - 1;
  }

  remove(index: number): void {
    this.variables.removeAt(index);
  }

  propagateChange = (_: {variables: EnvironmentVariable[]}) => {};

  writeValue(): void {}

  registerOnChange(fn: (_: {variables: EnvironmentVariable[]}) => void): void {
    this.propagateChange = fn;
  }
  registerOnTouched(): void {}
}
