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

import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NamespaceList} from '@api/backendapi';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {NamespaceAddDialog} from './adddialog/dialog';

@Component({
  selector: 'kd-namespace-selector-new',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class NamespaceSelectorComponent implements OnInit {
  @Input() multi = false;
  @Input() hasInput = true;

  namespaces = ['default', 'kube-system', 'kubernetes-dashboard'];
  selectNamespaceInput = '';
  selectedNamespace = '';
  namespaces$: Observable<string[]>;
  form = new FormControl();

  constructor(private readonly namespace_: ResourceService<NamespaceList>, private readonly dialog_: MatDialog) {}

  ngOnInit(): void {
    const namespaceEndpoint = EndpointManager.resource(Resource.namespace).list();
    this.namespaces$ = this.namespace_
      .get(namespaceEndpoint, undefined, undefined)
      .pipe(map(nsList => nsList.namespaces.map(ns => ns.objectMeta.name)));
  }

  addCustomNamespace(): void {
    this.dialog_
      .open(NamespaceAddDialog)
      .afterClosed()
      .subscribe(confirmed => {
        console.log(confirmed);
      });
  }

  // addNamespace(event: MatChipInputEvent): void {
  //   if (event.value && this.settings.namespaceFallbackList.indexOf(event.value) < 0) {
  //     this.settings.namespaceFallbackList.push(event.value);
  //     this.namespaceListInput.nativeElement.value = '';
  //   }
  // }
  //
  // removeNamespace(namespace: string): void {
  //   const idx = this.settings.namespaceFallbackList.indexOf(namespace);
  //
  //   if (idx >= 0) {
  //     this.settings.namespaceFallbackList.splice(idx, 1);
  //   }
  // }
  //
  // selectedNamespace(event: MatAutocompleteSelectedEvent): void {
  //   if (event.option.viewValue && this.settings.namespaceFallbackList.indexOf(event.option.viewValue) < 0) {
  //     this.settings.namespaceFallbackList.push(event.option.viewValue);
  //     this.namespaceListInput.nativeElement.value = '';
  //   }
  // }
}
