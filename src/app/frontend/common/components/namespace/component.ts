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
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NamespaceList } from '@api/backendapi';
import { Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { CONFIG } from '../../../index.config';

import { NAMESPACE_STATE_PARAM } from '../../params/params';
import { NamespaceService } from '../../services/global/namespace';
import {
  NotificationSeverity,
  NotificationsService,
} from '../../services/global/notifications';
import { KdStateService } from '../../services/global/state';
import { EndpointManager, Resource } from '../../services/resource/endpoint';
import { ResourceService } from '../../services/resource/resource';

@Component({
  selector: 'kd-namespace-selector',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class NamespaceSelectorComponent implements OnInit, OnDestroy {
  private namespaceUpdate_ = new Subject();
  private unsubscribe_ = new Subject();
  private readonly endpoint_ = EndpointManager.resource(Resource.namespace);

  namespaces: string[] = [];
  selectNamespaceInput = '';
  allNamespacesKey: string;
  selectedNamespace: string;

  @ViewChild(MatSelect, { static: true }) private readonly select_: MatSelect;
  @ViewChild('namespaceInput', { static: true })
  private readonly namespaceInputEl_: ElementRef;

  constructor(
    private readonly router_: Router,
    private readonly namespaceService_: NamespaceService,
    private readonly namespace_: ResourceService<NamespaceList>,
    private readonly dialog_: MatDialog,
    private readonly kdState_: KdStateService,
    private readonly notifications_: NotificationsService,
    private readonly route_: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route_.queryParams
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(params => {
        const namespace = params.namespace;
        if (!namespace) {
          this.setDefaultQueryParams_();
          return;
        }

        if (this.namespaceService_.current() === namespace) {
          return;
        }

        this.namespaceService_.setCurrent(namespace);
        this.namespaceService_.onNamespaceChangeEvent.emit(namespace);
        this.selectedNamespace = namespace;
      });

    // this.kdState_.onSuccess.pipe(takeUntil(this.unsubscribe_)).subscribe(() => {
    //   if (this.shouldShowNamespaceChangeDialog()) {
    //     this.handleNamespaceChangeDialog_();
    //   }
    // });

    this.allNamespacesKey = this.namespaceService_.getAllNamespacesKey();
    this.selectedNamespace = this.namespaceService_.current();
    this.select_.value = this.selectedNamespace;
    this.loadNamespaces_();
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
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
      this.namespaceUpdate_.next();
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

    if (
      targetNamespace &&
      (this.namespaces.indexOf(targetNamespace) >= 0 ||
        targetNamespace === this.allNamespacesKey ||
        this.namespaceService_.isNamespaceValid(targetNamespace))
    ) {
      newNamespace = targetNamespace;
    }

    if (newNamespace !== this.selectedNamespace) {
      this.changeNamespace_(newNamespace);
    }
  }

  private loadNamespaces_(): void {
    this.namespaceUpdate_
      .pipe(takeUntil(this.unsubscribe_))
      .pipe(startWith({}))
      .pipe(switchMap(() => this.namespace_.get(this.endpoint_.list())))
      .subscribe(
        namespaceList => {
          this.namespaces = namespaceList.namespaces.map(
            n => n.objectMeta.name
          );

          if (namespaceList.errors.length > 0) {
            for (const err of namespaceList.errors) {
              this.notifications_.push(
                err.ErrStatus.message,
                NotificationSeverity.error
              );
            }
          }
        },
        undefined,
        () => {
          this.onNamespaceLoaded_();
        }
      );
  }

  // private handleNamespaceChangeDialog_(): void {
  //   const resourceNamespace = this.route_.snapshot.params.resourceNamespace;
  //   this.dialog_
  //       .open(NamespaceChangeDialog, {
  //         data: {namespace: this.namespaceService_.current(), newNamespace: resourceNamespace},
  //       })
  //       .afterClosed()
  //       .subscribe(confirmed => {
  //         if (confirmed) {
  //           this.router_.navigate(
  //               [this.route_.snapshot.url],
  //               {queryParams: {[NAMESPACE_STATE_PARAM]: resourceNamespace}});
  //         } else {
  //           this.selectedNamespace = this.namespaceService_.current();
  //           this.router_.navigate(
  //               [overviewState.name],
  //               {queryParams: {[NAMESPACE_STATE_PARAM]: this.selectedNamespace}});
  //         }
  //       });
  // }

  private changeNamespace_(namespace: string): void {
    this.clearNamespaceInput_();

    // if (this.shouldShowNamespaceChangeDialog()) {
    //   this.handleNamespaceChangeDialog_();
    //   return;
    // }

    if (this.isOnDetailsView_()) {
      this.router_.navigate(['overview'], {
        queryParams: { [NAMESPACE_STATE_PARAM]: namespace },
      });
    } else {
      this.router_.navigate([this.getRawUrl(this.router_.url)], {
        queryParams: { [NAMESPACE_STATE_PARAM]: namespace },
        queryParamsHandling: 'merge',
      });
    }
  }

  private getRawUrl(url: string) {
    if (!url) {
      return '';
    }

    return url.split('?')[0];
  }

  private clearNamespaceInput_(): void {
    this.selectNamespaceInput = '';
  }

  // private shouldShowNamespaceChangeDialog(): boolean {
  //   const resourceNamespace = this.namespaceService_.getResourceNamespace();
  //   const namespace = this.namespaceService_.current();
  //
  //   return namespace !== this.allNamespacesKey && resourceNamespace &&
  //       resourceNamespace !== namespace;
  // }
  //
  private isOnDetailsView_(): boolean {
    return this.route_.snapshot.params.resourceNamespace !== undefined;
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

  setDefaultQueryParams_() {
    this.router_.navigate([this.route_.snapshot.url], {
      queryParams: { [NAMESPACE_STATE_PARAM]: CONFIG.defaultNamespace },
      queryParamsHandling: 'merge',
    });
  }
}
