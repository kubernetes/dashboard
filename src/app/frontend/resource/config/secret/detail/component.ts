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
import {SecretDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-secret-detail',
  templateUrl: './template.html',
})
export class SecretDetailComponent implements OnInit, OnDestroy {
  private secretSubscription_: Subscription;
  private secretName_: string;
  secret: SecretDetail;
  isInitialized = false;

  constructor(
      private readonly secret_: NamespacedResourceService<SecretDetail>,
      private readonly state_: StateService) {}

  ngOnInit(): void {
    this.secretName_ = this.state_.params.resourceName;
    this.secretSubscription_ =
        this.secret_.get(EndpointManager.resource(Resource.secret, true).detail(), this.secretName_)
            .startWith({})
            .subscribe((d: SecretDetail) => {
              this.secret = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.secretSubscription_.unsubscribe();
  }

  getDataKeys(): string[] {
    return this.secret && this.secret.data ? Object.keys(this.secret.data) : [];
  }

  decode(s: string): string {
    return atob(s);
  }
}
