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

import {Component, Input, OnDestroy} from '@angular/core';
import {ObjectMeta, TypeMeta} from '@api/backendapi';
import {ActionColumn} from '@api/frontendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';
import {VerberService} from '../../../../services/global/verber';

@Component({
  selector: 'kd-logs-button',
  templateUrl: './template.html',
})
export class MenuComponent implements ActionColumn, OnDestroy {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  private onEditSubscription_: Subscription;
  private onDeleteSubscription_: Subscription;

  constructor(private readonly verber_: VerberService, private readonly state_: StateService) {}

  ngOnDestroy(): void {
    if (this.onEditSubscription_) this.onEditSubscription_.unsubscribe();
    if (this.onDeleteSubscription_) this.onDeleteSubscription_.unsubscribe();
  }

  onEdit(): void {
    this.onEditSubscription_ = this.verber_.onEdit.subscribe(this.onSuccess_.bind(this));
    // TODO think how to pass proper display name.
    this.verber_.showEditDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onDelete(): void {
    this.onDeleteSubscription_ = this.verber_.onDelete.subscribe(this.onSuccess_.bind(this));
    // TODO think how to pass proper display name.
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  private onSuccess_(): void {
    this.state_.reload();
  }
}
