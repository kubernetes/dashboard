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
import {PersistentVolumeClaimDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-persistent-volume-claim-detail',
  templateUrl: './template.html',
})
export class PersistentVolumeClaimDetailComponent implements OnInit, OnDestroy {
  private persistentVolumeClaimSubscription_: Subscription;
  private persistentVolumeClaimName_: string;
  persistentVolumeClaim: PersistentVolumeClaimDetail;
  isInitialized = false;

  constructor(
      private readonly persistentVolumeClaim_:
          NamespacedResourceService<PersistentVolumeClaimDetail>,
      private readonly state_: StateService) {}

  ngOnInit(): void {
    this.persistentVolumeClaimName_ = this.state_.params.resourceName;
    this.persistentVolumeClaimSubscription_ =
        this.persistentVolumeClaim_
            .get(
                EndpointManager.resource(Resource.persistentVolumeClaim, true).detail(),
                this.persistentVolumeClaimName_)
            .startWith({})
            .subscribe((d: PersistentVolumeClaimDetail) => {
              this.persistentVolumeClaim = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.persistentVolumeClaimSubscription_.unsubscribe();
  }
}
