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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatSelect} from '@angular/material';
import {StateService} from '@uirouter/core';
import {NAMESPACE_STATE_PARAM} from '../../params/params';
import {NamespaceService} from '../../services/global/namespace';

@Component({
  selector: 'kd-namespace-selector',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class NamespaceSelectorComponent implements OnInit {
  private readonly namespacesInitialized_ = false;

  namespaces: string[] = ['default'];
  selectNamespaceInput = '';
  allNamespacesKey: string;
  selectedNamespace: string;

  @ViewChild(MatSelect) private readonly select_: MatSelect;
  @ViewChild('namespaceInput') private readonly namespaceInputEl_: ElementRef;

  constructor(
      private readonly state_: StateService, private readonly namespaceService_: NamespaceService) {
  }
  // private readonly namespace_: ResourceService<NamespaceList>,) {}

  ngOnInit(): void {
    this.allNamespacesKey = this.namespaceService_.getAllNamespacesKey();
    this.selectedNamespace = this.namespaceService_.current();
    this.select_.value = this.selectedNamespace;
  }

  selectNamespace(): void {
    if (this.selectNamespaceInput.length > 0) {
      this.selectedNamespace = this.selectNamespaceInput;
      this.select_.close();
      this.changeNamespace_();
    }
  }

  onNamespaceToggle(opened: boolean): void {
    if (opened) {
      this.loadNamespacesIfNeeded_();
    } else {
      this.changeNamespace_();
    }
  }

  private loadNamespacesIfNeeded_(): void {
    this.focusNamespaceInput_();
    if (!this.namespacesInitialized_) {
      // this.namespace_.get(EndpointManager.resource(Resource.namespace).list()).subscribe(
      //   namespaceList => {
      //     this.namespaces = namespaceList.namespaces.map(n => n.objectMeta.name);
      //     this.namespacesInitialized_ = true;
      //   });
    }
  }

  private changeNamespace_(): void {
    this.clearNamespaceInput_();
    this.state_.go('.', {[NAMESPACE_STATE_PARAM]: this.selectedNamespace});
  }

  private clearNamespaceInput_(): void {
    this.selectNamespaceInput = '';
  }

  /**
   * Focuses namespace input field after clicking on namespace selector menu.
   */
  private focusNamespaceInput_(): void {
    // Wrap in a timeout to make sure that element is rendered before looking for it.
    setTimeout(() => {
      this.namespaceInputEl_.nativeElement.focus();
    }, 150);
  }
}
