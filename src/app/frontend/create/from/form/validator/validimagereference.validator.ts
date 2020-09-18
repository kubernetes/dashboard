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
import {Directive, forwardRef, Input} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, Validator} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';

export const uniqueNameValidationKey = 'validImageReference';

/**
 * A validator directive which checks the underlining ngModel's given name is unique or not.
 * If the name exists, error with name `uniqueName` will be added to errors.
 */
@Directive({
  selector: '[kdValidImageReference]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => ValidImageReferenceValidator),
      multi: true,
    },
  ],
})
export class ValidImageReferenceValidator implements AsyncValidator, Validator {
  @Input() namespace: string;

  constructor(private readonly http: HttpClient) {}

  validate(control: AbstractControl): Observable<{[key: string]: string}> {
    if (!control.value) {
      return of(null);
    }
    return this.http
      .post<{valid: boolean; reason: string}>('api/v1/appdeployment/validate/imagereference', {
        reference: control.value,
      })
      .pipe(
        debounceTime(500),
        map(res => (!res.valid ? {[uniqueNameValidationKey]: res.reason} : null))
      );
  }
}
