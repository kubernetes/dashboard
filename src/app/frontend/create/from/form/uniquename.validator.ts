import {HttpClient} from '@angular/common/http';
import {Directive, forwardRef, Injector, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, AsyncValidator, FormControl, NG_ASYNC_VALIDATORS, NgModel, Validator} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {debounceTime, map} from 'rxjs/operators';

export const uniqueNameValidationKey = 'uniqueName';

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
