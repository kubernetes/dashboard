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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CRDDetail} from '@api/backendapi';
import {Subscription} from 'rxjs';

import {ActionbarService} from '../../common/services/global/actionbar';
import {NotificationsService} from '../../common/services/global/notifications';
import {ResourceService} from '../../common/services/resource/resource';

@Component({selector: 'kd-crd-detail', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class CRDDetailComponent implements OnInit, OnDestroy {
  private crdSubscription_: Subscription;

  constructor(
      private readonly crd_: ResourceService<CRDDetail>,
      private readonly actionbar_: ActionbarService,
      private readonly activatedRoute_: ActivatedRoute,
      private readonly notifications_: NotificationsService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.crdSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }
}
