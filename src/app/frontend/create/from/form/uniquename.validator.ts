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

import {HttpClient} from '@angular/common/http';
import {Directive, forwardRef, Injector, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, AsyncValidator, FormControl, NG_ASYNC_VALIDATORS, NgModel, Validator} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {debounceTime, map} from 'rxjs/operators';

export const uniqueNameValidationKey = 'uniqueName';

/**
 * A validator directive which checks the underlining ngModel's given name is unique or not.
 * If the name exists, error with name `uniqueName` will be added to errors.
 */
@Directive({
  selector: '[kdUniqueName][ngModel]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => UniqueNameValidator),
    multi: true
  }]
})
export class UniqueNameValidator implements AsyncValidator, Validator, OnChanges {
  @Input() namespace: string;

  constructor(private readonly injector: Injector, private readonly http: HttpClient) {}

  validate(control: AbstractControl): Observable<{[key: string]: boolean}> {
    if (!control.value) {
      return Observable.of(null);
    } else {
      return this.http
          .post<{valid: boolean}>(
              'api/v1/appdeployment/validate/name',
              {name: control.value, namespace: this.namespace})
          .pipe(
              debounceTime(500),
              map(res => !res.valid ? {[uniqueNameValidationKey]: control.value} : null));
    }
  }

  ngOnChanges({namespace}: SimpleChanges): void {
    if (namespace && !namespace.firstChange) {
      this.injector.get(NgModel).control.updateValueAndValidity();
    }
  }
}
