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
import {StorageClassDetail, StringMap} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {ResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-storage-class-detail',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class StorageClassDetailComponent implements OnInit, OnDestroy {
  private storageClassSubscription_: Subscription;
  private storageClassName_: string;
  storageClass: StorageClassDetail;
  isInitialized = false;

  constructor(
      private readonly storageClass_: ResourceService<StorageClassDetail>,
      private readonly state_: StateService) {}

  ngOnInit(): void {
    this.storageClassName_ = this.state_.params.resourceName;
    this.storageClassSubscription_ =
        this.storageClass_
            .get(EndpointManager.resource(Resource.storageClass).detail(), this.storageClassName_)
            .subscribe((d: StorageClassDetail) => {
              this.storageClass = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.storageClassSubscription_.unsubscribe();
  }

  getParameterNames(): string[] {
    return Object.keys(this.storageClass.parameters);
  }
}
