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
import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_ASYNC_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import {PortMapping} from '@api/root.api';
import {Observable} from 'rxjs';
import {filter, map, startWith, take} from 'rxjs/operators';
import {FormValidators} from '../validator/validators';
import {validateProtocol} from '../validator/validprotocol.validator';

const i18n = {
  MSG_PORT_MAPPINGS_SERVICE_TYPE_NONE_LABEL: 'None',
  MSG_PORT_MAPPINGS_SERVICE_TYPE_INTERNAL_LABEL: 'Internal',
  MSG_PORT_MAPPINGS_SERVICE_TYPE_EXTERNAL_LABEL: 'External',
};

interface ServiceType {
  label: string;
  external: boolean;
}

const NO_SERVICE: ServiceType = {
  label: i18n.MSG_PORT_MAPPINGS_SERVICE_TYPE_NONE_LABEL,
  external: false,
};

const INT_SERVICE: ServiceType = {
  label: i18n.MSG_PORT_MAPPINGS_SERVICE_TYPE_INTERNAL_LABEL,
  external: false,
};

const EXT_SERVICE: ServiceType = {
  label: i18n.MSG_PORT_MAPPINGS_SERVICE_TYPE_EXTERNAL_LABEL,
  external: true,
};

@Component({
  selector: 'kd-port-mappings',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PortMappingsComponent),
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => PortMappingsComponent),
      multi: true,
    },
  ],
})
export class PortMappingsComponent implements OnInit, ControlValueAccessor {
  @Input() protocols: string[];
  @Input() isExternal: boolean;
  @Output() changeExternal: EventEmitter<boolean> = new EventEmitter<boolean>();

  serviceTypes: ServiceType[];
  portMappingForm: FormGroup;

  constructor(private readonly fb_: FormBuilder, private readonly http_: HttpClient) {}

  ngOnInit(): void {
    this.serviceTypes = [NO_SERVICE, INT_SERVICE, EXT_SERVICE];

    this.portMappingForm = this.fb_.group({
      serviceType: NO_SERVICE,
      portMappings: this.fb_.array([]),
    });
    this.serviceType.valueChanges.subscribe(() => {
      this.changeServiceType();
    });
    this.portMappingForm.valueChanges.subscribe(v => {
      this.propagateChange(v);
    });
  }

  validate(_: FormControl): Observable<{[key: string]: boolean} | null> {
    return this.portMappingForm.statusChanges.pipe(
      startWith(this.portMappingForm.status),
      filter(() => !this.portMappingForm.pending),
      take(1),
      map(() => {
        return this.portMappingForm.invalid ? {error: true} : null;
      })
    );
  }

  changeServiceType(): void {
    // add or remove port mappings
    if (this.serviceType.value === NO_SERVICE) {
      const length = this.portMappings.length;
      for (let i = 0; i < length; i++) {
        this.portMappings.removeAt(0);
      }
    } else if (this.portMappings.length === 0) {
      this.portMappings.push(this.newEmptyPortMapping(this.protocols[0]));
    }

    // set flag
    this.isExternal = this.serviceType.value.external;
    this.changeExternal.emit(this.isExternal);

    for (let i = 0; i < this.portMappings.length; i++) {
      const ele = this.portMappings.at(i).get('protocol');
      ele.clearAsyncValidators();
      ele.setAsyncValidators(validateProtocol(this.http_, this.isExternal));
      ele.updateValueAndValidity();
    }
  }

  get portMappings(): FormArray {
    return this.portMappingForm.get('portMappings') as FormArray;
  }

  get serviceType(): AbstractControl {
    return this.portMappingForm.get('serviceType') as AbstractControl;
  }

  private newEmptyPortMapping(defaultProtocol: string): FormGroup {
    return this.fb_.group({
      port: ['', Validators.compose([FormValidators.isInteger, Validators.min(1), Validators.max(65535)])],
      targetPort: ['', Validators.compose([FormValidators.isInteger, Validators.min(1), Validators.max(65535)])],
      protocol: [defaultProtocol],
    });
  }

  /**
   * Call checks on port mapping:
   *  - adds new port mapping when last empty port mapping has been filled
   *  - validates port mapping
   */
  checkPortMapping(portMappingIndex: number): void {
    this.addProtocolIfNeeed();
    this.validatePortMapping(portMappingIndex);
    this.portMappings.updateValueAndValidity();
  }

  addProtocolIfNeeed(): void {
    const lastPortMapping = this.portMappings.controls[this.portMappings.length - 1];
    if (this.isPortMappingFilled(lastPortMapping)) {
      this.portMappings.push(this.newEmptyPortMapping(this.protocols[0]));
    }
  }

  /**
   * Returns true when the given port mapping is filled by the user, i.e., is not empty.
   */
  private isPortMappingFilled(portMapping: AbstractControl): boolean {
    return !!portMapping.get('port').value && !!portMapping.get('targetPort').value;
  }

  /**
   * Validates port mapping. In case when only one port is specified it is considered as invalid.
   */
  private validatePortMapping(portIndex: number): void {
    if (portIndex === 0) {
      return;
    }
    const portMapping = this.portMappings.at(portIndex);

    const portElem = portMapping.get('port');
    const targetPortElem = portMapping.get('targetPort');
    const port = portElem.value;
    const targetPort = targetPortElem.value;

    const filledOrEmpty = this.isPortMappingFilledOrEmpty(port, targetPort);
    const isValidPort = filledOrEmpty || !!port;
    const isValidTargetPort = filledOrEmpty || !!targetPort;

    portElem.setErrors(isValidPort ? null : {required: true});
    targetPortElem.setErrors(isValidTargetPort ? null : {required: true});
    this.portMappingForm.updateValueAndValidity();
  }

  /**
   * Returns true when the given port mapping is filled or empty (both ports), false otherwise.
   */
  private isPortMappingFilledOrEmpty(port: number, targetPort: number): boolean {
    return !port === !targetPort;
  }

  isRemovable(index: number): boolean {
    return index !== this.portMappings.length - 1;
  }

  remove(index: number): void {
    this.portMappings.removeAt(index);
  }

  /**
   * Returns true if the given port mapping is the first in the list.
   * @param {number} index
   */
  isFirst(index: number): boolean {
    return index === 0;
  }

  propagateChange = (_: {portMappings: PortMapping[]}) => {};

  writeValue(): void {}

  registerOnChange(fn: (_: {portMappings: PortMapping[]}) => void): void {
    this.propagateChange = fn;
  }
  registerOnTouched(): void {}
}
