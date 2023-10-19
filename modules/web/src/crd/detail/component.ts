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

import {Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CRDDetail} from '@api/root.api';
import {switchMap, tap} from 'rxjs/operators';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {ResourceService} from '@common/services/resource/resource';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({selector: 'kd-crd-detail', templateUrl: './template.html'})
export class CRDDetailComponent implements OnInit, OnDestroy {
  crd: CRDDetail;
  crdName: string;
  isInitialized = false;

  private readonly endpoint_ = EndpointManager.resource(Resource.crd);

  private destroyRef = inject(DestroyRef);
  constructor(
    private readonly crd_: ResourceService<CRDDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute_.params
      .pipe(tap(params => (this.crdName = params.crdName)))
      .pipe(switchMap(_ => this.crd_.get(this.endpoint_.detail(), this.crdName)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((d: CRDDetail) => {
        this.crd = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta(d.names.kind, d.objectMeta, d.typeMeta, this.isNamespaced()));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.actionbar_.onDetailsLeave.emit();
  }

  isNamespaced(): boolean {
    return this.crd && this.crd.scope === 'Namespaced';
  }
}
