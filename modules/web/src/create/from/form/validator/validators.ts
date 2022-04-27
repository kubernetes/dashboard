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

import {FormControl} from '@angular/forms';

export class FormValidators {
  /**
   * Checks that a name begins and ends with a lowercase letter
   * and contains nothing but lowercase letters and hyphens ("-")
   * (leading and trailing spaces are ignored by default)
   */
  static namePattern(control: FormControl): {[key: string]: object} {
    if (control.value) {
      const namePattern = new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$');
      const result = namePattern.test(control.value);
      return result ? null : {namePattern: {value: control.value}};
    }
    return null;
  }

  /**
   * Returns true if given value is a correct integer value, false otherwise.
   * When value is undefined or empty then it is considered as correct value in order
   * to not conflict with other validations like 'required'.
   */
  static isInteger(control: FormControl): {[key: string]: object} {
    const value = control.value;
    if (value) {
      const result = (Number(value) === value && value % 1 === 0) || !value;
      return result ? null : {kdValidInteger: {value: control.value}};
    }
    return null;
  }

  /**
   * Returns true if the label key name (after the "/" if there is one) is equal or shorter than 63
   * characters, otherwise returns false.
   */
  static labelKeyNameLength(control: FormControl): {[key: string]: object} {
    const value = control.value;
    const maxKeyLength = 63;

    const slashPosition = value.indexOf('/');
    const labelKeyName = slashPosition > -1 ? value.substring(slashPosition + 1) : value;

    return labelKeyName.length <= maxKeyLength ? null : {kdValidLabelKeyPrefixLength: {value: true}};
  }

  /**
   * Returns true if the label key prefix (before the "/" if there is one) is equal or shorter than
   * 253 characters, otherwise returns false.
   */
  static labelKeyPrefixLength(control: FormControl): {[key: string]: object} {
    const value = control.value;
    const maxKeyLength = 253;

    const slashPosition = value.indexOf('/');
    const labelKeyPrefix = slashPosition > -1 ? value.substring(0, slashPosition) : '';

    return labelKeyPrefix.length <= maxKeyLength ? null : {kdValidLabelKeyPrefixLength: {value: true}};
  }

  /**
   * Returns true if the label key name (after the "/" if there is one) matches an alphanumeric
   * character (upper or lower case) optionally followed by alphanumeric or -_. and ending
   * with an alphanumeric character (upper or lower case), otherwise returns false.
   */
  static labelKeyNamePattern(control: FormControl): {[key: string]: object} {
    const value = control.value;
    const labelKeyNamePattern = /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;

    const slashPosition = value.indexOf('/');
    const labelKeyName = slashPosition > -1 ? value.substring(slashPosition + 1) : value;

    return labelKeyNamePattern.test(labelKeyName) || value === '' ? null : {kdValidLabelKeyNamePattern: {value: true}};
  }

  static labelKeyPrefixPattern(control: FormControl): {[key: string]: object} {
    const value = control.value;
    const labelKeyPrefixPattern = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

    const slashPosition = value.indexOf('/');

    const isValid = slashPosition > -1 ? labelKeyPrefixPattern.test(value.substring(0, slashPosition)) : true;

    return isValid ? null : {kdValidLabelKeyPrefixPattern: {value: true}};
  }

  static labelValuePattern(control: FormControl): {[key: string]: object} {
    const value = control.value;
    const labelValuePattern = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;

    return labelValuePattern.test(value) ? null : {kdValidLabelValuePattern: {value: true}};
  }
}
