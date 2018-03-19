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

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatSelect} from '@angular/material';
import {NamespaceList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';
import {overviewState} from '../../../overview/state';

import {NAMESPACE_STATE_PARAM} from '../../params/params';
import {NamespaceService} from '../../services/global/namespace';
import {KdStateService} from '../../services/global/state';
import {EndpointManager, Resource} from '../../services/resource/endpoint';
import {ResourceService} from '../../services/resource/resource';
import {NamespaceChangeDialog} from './changedialog/dialog';

@Component({
  selector: 'kd-namespace-selector',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class NamespaceSelectorComponent implements OnInit, OnDestroy, AfterViewInit {
  private namespacesInitialized_ = false;
  private onSuccessStateChangeSubscription_: Subscription;

  namespaces: string[] = [];
  selectNamespaceInput = '';
  allNamespacesKey: string;
  selectedNamespace: string;

  @ViewChild(MatSelect) private readonly select_: MatSelect;
  @ViewChild('namespaceInput') private readonly namespaceInputEl_: ElementRef;

  constructor(
      private readonly state_: StateService, private readonly namespaceService_: NamespaceService,
      private readonly namespace_: ResourceService<NamespaceList>,
      private readonly dialog_: MatDialog, private readonly kdState_: KdStateService) {}

  ngOnInit(): void {
    this.allNamespacesKey = this.namespaceService_.getAllNamespacesKey();
    this.selectedNamespace = this.namespaceService_.current();
    this.select_.value = this.selectedNamespace;
    this.loadNamespacesIfNeeded_();
  }

  ngAfterViewInit(): void {
    this.onSuccessStateChangeSubscription_ = this.kdState_.onSuccess.subscribe(() => {
      if (this.shouldShowNamespaceChangeDialog()) {
        this.handleNamespaceChangeDialog_();
      }
    });

    // Avoid angular error 'ExpressionChangedAfterItHasBeenCheckedError'.
    // Related issue: https://github.com/angular/angular/issues/17572
    setTimeout(() => {
      if (this.shouldShowNamespaceChangeDialog()) {
        this.handleNamespaceChangeDialog_();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.onSuccessStateChangeSubscription_.unsubscribe();
  }

  selectNamespace(): void {
    if (this.selectNamespaceInput.length > 0) {
      this.selectedNamespace = this.selectNamespaceInput;
      this.select_.close();
      this.changeNamespace_(this.selectedNamespace);
    }
  }

  onNamespaceToggle(opened: boolean): void {
    if (opened) {
      this.focusNamespaceInput_();
    } else {
      this.changeNamespace_(this.selectedNamespace);
    }
  }

  formatNamespaceName(namespace: string): string {
    if (this.namespaceService_.isMultiNamespace(namespace)) {
      return 'All namespaces';
    }

    return namespace;
  }

  /**
   * When state is loaded and namespaces are fetched perform basic validation.
   */
  private onNamespaceLoaded_(): void {
    let newNamespace = this.namespaceService_.getDefaultNamespace();
    const targetNamespace = this.selectedNamespace;

    if (targetNamespace &&
        ((this.namespacesInitialized_ && this.namespaces.indexOf(targetNamespace) >= 0) ||
         targetNamespace === this.allNamespacesKey ||
         (!this.namespacesInitialized_ &&
          this.namespaceService_.isNamespaceValid(targetNamespace)))) {
      newNamespace = targetNamespace;
    }

    if (newNamespace !== this.selectedNamespace) {
      this.changeNamespace_(newNamespace);
    }
  }

  private loadNamespacesIfNeeded_(): void {
    if (!this.namespacesInitialized_) {
      this.namespace_.get(EndpointManager.resource(Resource.namespace).list())
          .subscribe(
              namespaceList => {
                this.namespaces = namespaceList.namespaces.map(n => n.objectMeta.name);
                this.namespacesInitialized_ = true;
              },
              undefined,
              () => {
                this.onNamespaceLoaded_();
              });
    }
  }

  private handleNamespaceChangeDialog_(): void {
    const resourceNamespace = this.state_.params.resourceNamespace;
    this.dialog_
        .open(NamespaceChangeDialog, {
          data: {namespace: this.state_.params.namespace, newNamespace: resourceNamespace},
        })
        .afterClosed()
        .subscribe(confirmed => {
          if (confirmed) {
            this.state_.go('.', {[NAMESPACE_STATE_PARAM]: resourceNamespace});
          } else {
            this.selectedNamespace = this.state_.params.namespace;
            this.state_.go(overviewState.name, {[NAMESPACE_STATE_PARAM]: this.selectedNamespace});
          }
        });
  }

  private changeNamespace_(namespace: string): void {
    this.clearNamespaceInput_();

    if (this.shouldShowNamespaceChangeDialog()) {
      this.handleNamespaceChangeDialog_();
      return;
    }

    if (this.isOnDetailsView()) {
      this.state_.go(overviewState.name, {[NAMESPACE_STATE_PARAM]: namespace});
    } else {
      this.state_.go('.', {[NAMESPACE_STATE_PARAM]: namespace});
    }
  }

  private clearNamespaceInput_(): void {
    this.selectNamespaceInput = '';
  }

  private shouldShowNamespaceChangeDialog(): boolean {
    const resourceNamespace = this.state_.params.resourceNamespace;
    const namespace = this.state_.params.namespace;
    return namespace !== this.allNamespacesKey && resourceNamespace &&
        resourceNamespace !== namespace;
  }

  private isOnDetailsView(): boolean {
    return this.state_.params.resourceNamespace !== undefined;
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
