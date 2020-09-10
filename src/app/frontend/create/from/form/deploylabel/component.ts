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

import {Component, forwardRef, Input} from '@angular/core';
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
import {FormValidators} from '../validator/validators';
import {DeployLabel} from './deploylabel';

interface DeployLabelI {
  value: string;
  index: number;
}

@Component({
  selector: 'kd-deploy-label',
  templateUrl: './template.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DeployLabelComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DeployLabelComponent),
      multi: true,
    },
  ],
})
export class DeployLabelComponent implements ControlValueAccessor {
  @Input() labelArr: DeployLabel[];

  labelForm: FormGroup;

  constructor(private readonly fb_: FormBuilder) {}

  ngOnInit(): void {
    this.labelForm = this.fb_.group({labels: this.fb_.array([])});
    this.labelForm.valueChanges.subscribe(v => {
      this.propagateChange(v);
    });
    for (let i = 0; i < this.labelArr.length; i++) {
      this.addNewLabel(this.labelArr[i].key, this.labelArr[i].value, this.labelArr[i].editable);
    }
  }

  validate(_: FormControl): {[key: string]: object} {
    return this.labelForm.valid ? null : {labelValid: {value: this.labels.at(0).errors}};
  }

  get labels(): FormArray {
    return this.labelForm.get('labels') as FormArray;
  }

  /**
   * Adds row to labels list.
   */
  private addNewLabel(key = '', value = '', editable = true): void {
    this.labels.push(
      this.fb_.group({
        key: [
          {value: key, disabled: !editable},
          Validators.compose([
            FormValidators.labelKeyNameLength,
            FormValidators.labelKeyNamePattern,
            FormValidators.labelKeyPrefixLength,
            FormValidators.labelKeyPrefixPattern,
          ]),
        ],
        value: [
          {value, disabled: !editable},
          Validators.compose([Validators.maxLength(253), FormValidators.labelValuePattern]),
        ],
        editable,
      })
    );
  }

  /**
   * Calls checks on label:
   *  - adds label if last empty label has been filled
   *  - checks for duplicated key and sets validity of element
   */
  check(index: number): void {
    this.addIfNeeded();
    this.validateKey(index);
  }

  /**
   * Returns true when label is editable and is not last on the list.
   * Used to indicate whether delete icon should be shown near label.
   */
  isRemovable(index: number): boolean {
    const lastElement = this.labels.at(this.labels.length - 1);
    const currentElement = this.labels.at(index);

    const currentkey = currentElement.get('key').value;
    const currentValue = currentElement.get('value').value;
    const currentEditable = currentElement.get('editable').value;
    const lastKey = lastElement.get('key').value;
    const lastValue = lastElement.get('value').value;

    return !!(currentEditable && currentkey !== lastKey && currentValue !== lastValue);
  }

  /**
   * Deletes row from labels list.
   */
  deleteLabel(index: number): void {
    this.labels.removeAt(index);
  }

  /**
   * Validates label within label form.
   * Current checks:
   *  - duplicated key
   */
  private validateKey(index: number): void {
    const elem = this.labels.at(index).get('key');

    const isUnique = !this.isKeyDuplicated(index);

    elem.setErrors(isUnique ? null : {unique: true});
    this.labelForm.updateValueAndValidity();
  }

  /**
   * Returns true if there are 2 or more labels with the same key on the labelList,
   * false otherwise.
   */
  private isKeyDuplicated(index: number): boolean {
    /** @type {number} */
    let duplications = 0;

    const currentKey = this.labels.at(index).get('key').value;
    for (let i = 0; i < this.labels.length; i++) {
      const key = this.labels.at(i).get('key').value;
      if (key.length !== 0 && key === currentKey) {
        duplications++;
      }
      if (duplications > 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Adds label if last label key and value has been filled.
   */
  private addIfNeeded(): void {
    const lastLabel = this.labels.at(this.labels.length - 1);
    if (this.isFilled(lastLabel)) {
      this.addNewLabel();
    }
  }

  /**
   * Returns true if label key and value are not empty, false otherwise.
   */
  private isFilled(label: AbstractControl): boolean {
    return label.get('key').value.length !== 0 && label.get('value').value.length !== 0;
  }

  propagateChange = (_: {labels: DeployLabel[]}) => {};

  writeValue(labels: DeployLabelI[]): void {
    if (labels.length > 0) {
      this.labels.at(labels[0].index).patchValue({value: labels[0].value});
    }
  }

  registerOnChange(fn: (_: {labels: DeployLabel[]}) => void): void {
    this.propagateChange = fn;
  }
  registerOnTouched(): void {}
}
