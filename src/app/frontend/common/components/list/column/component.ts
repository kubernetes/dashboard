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

import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {ActionColumn} from '@api/root.ui';
import {CRDDetail, Resource} from 'typings/root.api';

@Component({
  selector: 'kd-dynamic-cell',
  templateUrl: './template.html',
})
export class ColumnComponent<T extends ActionColumn> implements OnChanges {
  @Input() component: Type<T>;
  @Input() resource: Resource;
  @ViewChild('target', {read: ViewContainerRef, static: true}) target: ViewContainerRef;
  private componentRef_: ComponentRef<T> = undefined;

  constructor(private readonly resolver_: ComponentFactoryResolver) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.componentRef_ && changes.component) {
      this.target.remove();
      this.componentRef_ = undefined;
    }

    if (!this.componentRef_) {
      const factory = this.resolver_.resolveComponentFactory(this.component);
      this.componentRef_ = this.target.createComponent(factory);
    }

    this.componentRef_.instance.setObjectMeta(this.resource.objectMeta);
    this.componentRef_.instance.setTypeMeta(this.resource.typeMeta);

    if ((this.resource as CRDDetail).names !== undefined) {
      this.componentRef_.instance.setDisplayName((this.resource as CRDDetail).names.kind);
      this.componentRef_.instance.setNamespaced(this.isNamespaced_(this.resource as CRDDetail));
    }

    // Let the change detector run for out component
    this.componentRef_.changeDetectorRef.detectChanges();
  }

  private isNamespaced_(crd: CRDDetail): boolean {
    return crd && crd.scope === 'Namespaced';
  }
}
